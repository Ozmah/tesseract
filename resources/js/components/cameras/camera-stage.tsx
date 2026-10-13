import {
    ArrowClockwiseIcon,
    ArrowLeftIcon,
    ArrowsInIcon,
    ArrowsOutIcon,
    MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon,
} from '@phosphor-icons/react';
import { cn } from 'cn';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import {
    useEffect,
    useEffectEvent,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react';
import { CameraStatusBadge } from '@/components/cameras/camera-status-badge';
import { CameraSurface } from '@/components/cameras/camera-surface';
import { Button } from '@/components/ui/button';
import { useDigitalZoom } from '@/hooks/use-digital-zoom';
import { useWhepStream } from '@/hooks/use-whep-stream';
import { MAX_ZOOM, MIN_ZOOM } from '@/lib/digital-zoom';
import { hasShortcutModifier, isTypingTarget } from '@/lib/keyboard';
import type { Camera, StreamStatus } from '@/types';

const CONTROLS_IDLE_MS = 3000;

type CameraStageViewProps = {
    name: string;
    status: StreamStatus;
    onClose: () => void;
    onReconnect?: () => void;
    onResume?: () => void;
    keyboardShortcuts?: boolean;
    fill?: boolean;
    className?: string;
    children: ReactNode;
};

type OrientationLock = ScreenOrientation & {
    lock?: (orientation: 'landscape') => Promise<void>;
};

const subscribeToFullscreenSupport = () => () => {};
const getFullscreenSupport = () => document.fullscreenEnabled;
const getServerFullscreenSupport = () => false;

const TAP_MAX_DISTANCE = 10;
const TAP_MAX_DURATION_MS = 300;

/**
 * Single camera view with digital zoom and fullscreen. Controls fade out
 * while the stream plays and the pointer is idle; mouse movement or a key
 * brings them back, and a tap toggles them on touch screens. With fill it
 * takes its container's full size instead of a 16:9 box.
 *
 * Shortcuts: Esc returns to the grid, + and - zoom, 0 resets, F toggles
 * fullscreen.
 */
export function CameraStageView({
    name,
    status,
    onClose,
    onReconnect,
    onResume,
    keyboardShortcuts = true,
    fill = false,
    className,
    children,
}: CameraStageViewProps) {
    const stageRef = useRef<HTMLDivElement>(null);
    const {
        viewportRef,
        zoom,
        isZoomed,
        contentStyle,
        zoomIn,
        zoomOut,
        reset,
    } = useDigitalZoom();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const canFullscreen = useSyncExternalStore(
        subscribeToFullscreenSupport,
        getFullscreenSupport,
        getServerFullscreenSupport,
    );
    const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const touchStart = useRef<{ x: number; y: number; time: number } | null>(
        null,
    );

    const showControls = () => {
        setControlsVisible(true);
        clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(
            () => setControlsVisible(false),
            CONTROLS_IDLE_MS,
        );
    };

    const hideControls = () => {
        clearTimeout(idleTimer.current);
        setControlsVisible(false);
    };

    const toggleFullscreen = async () => {
        if (document.fullscreenElement) {
            await document.exitFullscreen();

            return;
        }

        await stageRef.current?.requestFullscreen();

        if (window.matchMedia('(pointer: coarse)').matches) {
            await (screen.orientation as OrientationLock)
                .lock?.('landscape')
                .catch(() => undefined);
        }
    };

    const pointerDown = (event: ReactPointerEvent) => {
        if (event.pointerType === 'touch') {
            touchStart.current = {
                x: event.clientX,
                y: event.clientY,
                time: performance.now(),
            };

            return;
        }

        showControls();
    };

    const pointerUp = (event: ReactPointerEvent) => {
        const start = touchStart.current;
        touchStart.current = null;

        if (
            event.pointerType !== 'touch' ||
            !start ||
            (event.target as Element).closest('button') ||
            Math.hypot(event.clientX - start.x, event.clientY - start.y) >
                TAP_MAX_DISTANCE ||
            performance.now() - start.time > TAP_MAX_DURATION_MS
        ) {
            return;
        }

        if (controlsVisible) {
            hideControls();
        } else {
            showControls();
        }
    };

    useEffect(() => {
        const change = () =>
            setIsFullscreen(document.fullscreenElement === stageRef.current);

        document.addEventListener('fullscreenchange', change);
        idleTimer.current = setTimeout(
            () => setControlsVisible(false),
            CONTROLS_IDLE_MS,
        );

        return () => {
            document.removeEventListener('fullscreenchange', change);
            clearTimeout(idleTimer.current);
        };
    }, []);

    const handleShortcut = useEffectEvent((event: KeyboardEvent) => {
        if (isTypingTarget(event) || hasShortcutModifier(event)) return;

        const actions: Record<string, () => void> = {
            Escape: () => {
                if (!document.fullscreenElement) onClose();
            },
            '+': zoomIn,
            '=': zoomIn,
            '-': zoomOut,
            '0': reset,
            f: () => void toggleFullscreen(),
        };
        const action = actions[event.key];

        if (action) {
            event.preventDefault();
            showControls();
            action();
        }
    });

    useEffect(() => {
        if (!keyboardShortcuts) return;

        const keydown = (event: KeyboardEvent) => handleShortcut(event);

        window.addEventListener('keydown', keydown);

        return () => window.removeEventListener('keydown', keydown);
    }, [keyboardShortcuts]);

    const hidden = !controlsVisible && status === 'playing';

    return (
        <div
            ref={stageRef}
            onPointerMove={(event) => {
                if (event.pointerType !== 'touch') showControls();
            }}
            onPointerDown={pointerDown}
            onPointerUp={pointerUp}
            onKeyDown={showControls}
            className={cn(
                'group/stage relative overscroll-none',
                fill || isFullscreen ? 'size-full' : 'aspect-video',
                hidden && 'cursor-none',
                className,
            )}
        >
            <CameraSurface
                status={status}
                onReconnect={onReconnect}
                onResume={onResume}
                className="absolute inset-0"
            >
                <div
                    ref={viewportRef}
                    className={cn(
                        'absolute inset-0 touch-none overflow-hidden select-none',
                        isZoomed && 'cursor-grab active:cursor-grabbing',
                    )}
                >
                    <div className="size-full" style={contentStyle}>
                        {children}
                    </div>
                </div>

                <div
                    className={cn(
                        'absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 bg-linear-to-b from-video-overlay to-transparent pt-[max(0.5rem,env(safe-area-inset-top))] pr-[max(0.5rem,env(safe-area-inset-right))] pb-6 pl-[max(0.5rem,env(safe-area-inset-left))] transition-opacity duration-300',
                        hidden && 'pointer-events-none opacity-0',
                    )}
                >
                    <div className="flex min-w-0 items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            aria-keyshortcuts={
                                keyboardShortcuts ? 'Escape' : undefined
                            }
                            className="h-11 px-3 text-video-overlay-foreground hover:bg-video-overlay hover:text-video-overlay-foreground"
                        >
                            <ArrowLeftIcon data-icon="inline-start" />
                            <span className="max-sm:sr-only">Cuadrícula</span>
                        </Button>
                        <h2 className="truncate font-heading text-sm font-semibold tracking-widest uppercase">
                            {name}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <CameraStatusBadge status={status} />
                        {onReconnect && (
                            <Button
                                variant="ghost"
                                size="icon-lg"
                                onClick={onReconnect}
                                aria-label="Reconectar"
                                className="text-video-overlay-foreground hover:bg-video-overlay hover:text-video-overlay-foreground"
                            >
                                <ArrowClockwiseIcon />
                            </Button>
                        )}
                    </div>
                </div>

                <div
                    className={cn(
                        'absolute right-[max(0.5rem,env(safe-area-inset-right))] bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-30 flex items-center gap-px bg-video-overlay transition-opacity duration-300',
                        hidden && 'pointer-events-none opacity-0',
                    )}
                >
                    <Button
                        variant="ghost"
                        size="icon-lg"
                        onClick={zoomOut}
                        disabled={zoom.scale <= MIN_ZOOM}
                        aria-label="Alejar"
                        aria-keyshortcuts={keyboardShortcuts ? '-' : undefined}
                        className="text-video-overlay-foreground hover:bg-interaction-hover hover:text-video-overlay-foreground"
                    >
                        <MagnifyingGlassMinusIcon />
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={reset}
                        disabled={!isZoomed}
                        aria-label={`Zoom ${zoom.scale.toFixed(1)}×, restablecer`}
                        aria-keyshortcuts={keyboardShortcuts ? '0' : undefined}
                        className="h-11 w-16 px-0 font-mono tracking-normal text-video-overlay-foreground normal-case tabular-nums hover:bg-interaction-hover hover:text-video-overlay-foreground disabled:opacity-100"
                    >
                        {zoom.scale.toFixed(1)}×
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-lg"
                        onClick={zoomIn}
                        disabled={zoom.scale >= MAX_ZOOM}
                        aria-label="Acercar"
                        aria-keyshortcuts={keyboardShortcuts ? '+' : undefined}
                        className="text-video-overlay-foreground hover:bg-interaction-hover hover:text-video-overlay-foreground"
                    >
                        <MagnifyingGlassPlusIcon />
                    </Button>
                    {canFullscreen && (
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            onClick={() => void toggleFullscreen()}
                            aria-label={
                                isFullscreen
                                    ? 'Salir de pantalla completa'
                                    : 'Pantalla completa'
                            }
                            aria-keyshortcuts={
                                keyboardShortcuts ? 'F' : undefined
                            }
                            className="text-video-overlay-foreground hover:bg-interaction-hover hover:text-video-overlay-foreground"
                        >
                            {isFullscreen ? (
                                <ArrowsInIcon />
                            ) : (
                                <ArrowsOutIcon />
                            )}
                        </Button>
                    )}
                </div>
            </CameraSurface>
        </div>
    );
}

type CameraStageProps = {
    camera: Camera;
    mediaUrl: string;
    onClose: () => void;
    fill?: boolean;
    className?: string;
};

/**
 * Single camera view playing the main stream at full quality.
 */
export function CameraStage({
    camera,
    mediaUrl,
    onClose,
    fill,
    className,
}: CameraStageProps) {
    const { videoRef, status, reconnect } = useWhepStream(
        mediaUrl,
        camera.mainPath,
    );

    return (
        <CameraStageView
            name={camera.name}
            status={status}
            onClose={onClose}
            onReconnect={reconnect}
            onResume={() => void videoRef.current?.play()}
            fill={fill}
            className={className}
        >
            <video
                ref={videoRef}
                aria-label={`Video en vivo de ${camera.name}`}
                autoPlay
                muted
                playsInline
                className="size-full object-contain"
            />
        </CameraStageView>
    );
}
