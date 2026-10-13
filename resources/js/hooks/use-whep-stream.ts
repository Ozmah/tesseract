import type { RefObject } from 'react';
import {
    useEffect,
    useReducer,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react';
import { WhepSession } from '@/lib/whep-client';
import type { StreamStatus } from '@/types';

const FRAME_TIMEOUT_MS = 20000;
const MAX_RETRY_DELAY_MS = 15000;

const subscribeToCapabilities = () => () => {};
const getCapabilities = () =>
    window.isSecureContext && 'RTCPeerConnection' in window;
const getServerCapabilities = (): boolean | null => null;

export type WhepStream = {
    videoRef: RefObject<HTMLVideoElement | null>;
    status: StreamStatus;
    reconnect: () => void;
};

/**
 * Plays a MediaMTX path over WHEP into the returned video element.
 *
 * Retries with exponential backoff, and treats a stream that stops
 * delivering frames while visible as failed. Changing the path closes the
 * current session and opens a new one.
 */
export function useWhepStream(mediaUrl: string, path: string): WhepStream {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [attempt, retry] = useReducer((value: number) => value + 1, 0);
    const [status, setStatus] = useState<StreamStatus>('connecting');
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

        setStatus('connecting');

        const fail = () => {
            if (disposed || failed) return;
            failed = true;
            setStatus('retrying');
            session?.close();
            video.srcObject = null;
            retryTimer = setTimeout(
                retry,
                Math.min(2000 * 2 ** Math.min(attempt, 3), MAX_RETRY_DELAY_MS),
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
            if (performance.now() - lastFrame > FRAME_TIMEOUT_MS) fail();
        }, 2000);

        try {
            const endpoint = new URL(
                `${path}/whep`,
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
    }, [attempt, mediaUrl, path, supported]);

    return {
        videoRef,
        status: supported === false ? 'unsupported' : status,
        reconnect: retry,
    };
}
