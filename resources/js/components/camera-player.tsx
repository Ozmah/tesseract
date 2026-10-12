import {
    useEffect,
    useReducer,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react';
import { Button } from '@/components/ui/button';
import { WhepSession } from '@/lib/whep-client';

type CameraPlayerProps = {
    name: string;
    mediaUrl: string;
    path: string;
};

type Status = 'connecting' | 'playing' | 'paused' | 'retrying' | 'unsupported';
const statusLabels: Record<Status, string> = {
    connecting: 'Conectando…',
    playing: 'En vivo',
    paused: 'Pausado',
    retrying: 'Reconectando…',
    unsupported: 'WebRTC no está disponible en este navegador',
};

const subscribeToCapabilities = () => () => {};
const getCapabilities = () =>
    window.isSecureContext && 'RTCPeerConnection' in window;
const getServerCapabilities = (): boolean | null => null;

export default function CameraPlayer({
    name,
    mediaUrl,
    path,
}: CameraPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [quality, setQuality] = useState<'main' | 'sub'>('main');
    const [attempt, reconnect] = useReducer((value: number) => value + 1, 0);
    const [status, setStatus] = useState<Status>('connecting');
    const streamPath = quality === 'main' ? path : `${path}-sub`;
    const supported = useSyncExternalStore(
        subscribeToCapabilities,
        getCapabilities,
        getServerCapabilities,
    );

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !supported) return;

        let disposed = false;
        let failed = false;
        let lastFrame = performance.now();
        let frameCallback: number | undefined;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;
        let session: WhepSession | undefined;
        const supportsFrames =
            typeof video.requestVideoFrameCallback === 'function';

        const fail = () => {
            if (disposed || failed) return;
            failed = true;
            setStatus('retrying');
            session?.close();
            video.srcObject = null;
            retryTimer = setTimeout(
                () => {
                    setStatus('connecting');
                    reconnect();
                },
                Math.min(2000 * 2 ** Math.min(attempt, 3), 15000),
            );
        };
        const frame = () => {
            lastFrame = performance.now();
            if (!disposed && !failed && supportsFrames)
                frameCallback = video.requestVideoFrameCallback(frame);
        };
        const playing = () => {
            lastFrame = performance.now();
            if (!disposed && !failed) setStatus('playing');
        };
        const paused = () => {
            if (!disposed && !failed) setStatus('paused');
        };
        video.addEventListener('playing', playing);
        video.addEventListener('pause', paused);
        video.addEventListener('error', fail);
        if (supportsFrames)
            frameCallback = video.requestVideoFrameCallback(frame);
        else video.addEventListener('timeupdate', frame);

        const watchdog = setInterval(() => {
            if (
                document.visibilityState !== 'visible' ||
                (video.paused && video.readyState >= 2)
            )
                return;
            if (performance.now() - lastFrame > 20000) fail();
        }, 2000);

        try {
            const endpoint = new URL(
                `${streamPath}/whep`,
                `${mediaUrl.replace(/\/$/, '')}/`,
            );
            session = new WhepSession(endpoint, {
                onTrack: (track) => {
                    if (disposed) return;
                    video.srcObject = new MediaStream([track]);
                    void video.play().catch(() => {
                        if (!disposed && !failed) setStatus('paused');
                    });
                },
                onFailure: fail,
            });
            void session.start().catch(fail);
        } catch {
            fail();
        }

        return () => {
            disposed = true;
            clearInterval(watchdog);
            clearTimeout(retryTimer);
            if (frameCallback !== undefined)
                video.cancelVideoFrameCallback(frameCallback);
            video.removeEventListener('timeupdate', frame);
            video.removeEventListener('playing', playing);
            video.removeEventListener('pause', paused);
            video.removeEventListener('error', fail);
            session?.close();
            video.srcObject = null;
        };
    }, [attempt, mediaUrl, streamPath, supported]);

    return (
        <section
            aria-label={`Cámara ${name}`}
            className="overflow-hidden rounded-xl border border-border bg-card"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <h2 className="text-lg font-semibold">{name}</h2>
                <p role="status" className="text-sm text-muted-foreground">
                    {statusLabels[supported === false ? 'unsupported' : status]}
                </p>
            </div>
            <video
                ref={videoRef}
                aria-label={`Video en vivo de ${name}`}
                autoPlay
                muted
                playsInline
                controls
                className="aspect-video w-full bg-black object-contain"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <label className="flex items-center gap-3 text-sm">
                    Calidad
                    <select
                        aria-label={`Calidad de ${name}`}
                        value={quality}
                        onChange={(event) => {
                            setStatus('connecting');
                            setQuality(
                                event.target.value === 'main' ? 'main' : 'sub',
                            );
                        }}
                        className="min-h-11 rounded-md border border-input bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        <option value="main">Principal · 4K</option>
                        <option value="sub">Secundario · 360p</option>
                    </select>
                </label>
                <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() => {
                        setStatus('connecting');
                        reconnect();
                    }}
                    disabled={supported === false}
                >
                    Reconectar {name}
                </Button>
            </div>
        </section>
    );
}
