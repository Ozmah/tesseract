import { ArrowsOutIcon } from '@phosphor-icons/react';
import { cn } from 'cn';
import type { ReactNode } from 'react';
import { CameraStatusBadge } from '@/components/cameras/camera-status-badge';
import { CameraSurface } from '@/components/cameras/camera-surface';
import { useWhepStream } from '@/hooks/use-whep-stream';
import type { Camera, StreamStatus } from '@/types';

type CameraTileViewProps = {
    name: string;
    status: StreamStatus;
    shortcut?: string;
    onOpen: () => void;
    onReconnect?: () => void;
    onResume?: () => void;
    className?: string;
    children: ReactNode;
};

/**
 * Grid tile: the whole frame opens the camera. Only the name and status
 * stay on top of the video; the open hint appears on hover or focus.
 */
export function CameraTileView({
    name,
    status,
    shortcut,
    onOpen,
    onReconnect,
    onResume,
    className,
    children,
}: CameraTileViewProps) {
    return (
        <CameraSurface
            status={status}
            onReconnect={onReconnect}
            onResume={onResume}
            className={cn('group/tile aspect-video', className)}
        >
            {children}

            <button
                type="button"
                onClick={onOpen}
                aria-label={`Abrir ${name}`}
                aria-keyshortcuts={shortcut}
                className="absolute inset-0 z-10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 bg-linear-to-b from-video-overlay to-transparent p-3">
                <span className="flex items-center gap-2 font-heading text-sm font-semibold tracking-widest uppercase">
                    {name}
                    {shortcut && (
                        <kbd className="hidden border border-video-overlay-foreground/30 px-1.5 font-mono text-[0.6875rem] font-normal tracking-normal opacity-0 transition-opacity group-focus-within/tile:opacity-100 group-hover/tile:opacity-100 sm:inline">
                            {shortcut}
                        </kbd>
                    )}
                </span>
                <CameraStatusBadge status={status} />
            </div>

            <span className="pointer-events-none absolute right-3 bottom-3 z-30 inline-flex items-center gap-1.5 bg-video-overlay px-2 py-1 text-[0.6875rem] font-semibold tracking-widest uppercase opacity-0 transition-opacity group-focus-within/tile:opacity-100 group-hover/tile:opacity-100">
                <ArrowsOutIcon
                    aria-hidden="true"
                    weight="bold"
                    className="size-3.5"
                />
                Abrir
            </span>
        </CameraSurface>
    );
}

type CameraTileProps = {
    camera: Camera;
    mediaUrl: string;
    shortcut?: string;
    onOpen: () => void;
};

/**
 * Grid tile playing the camera's substream.
 */
export function CameraTile({
    camera,
    mediaUrl,
    shortcut,
    onOpen,
}: CameraTileProps) {
    const { videoRef, status, reconnect } = useWhepStream(
        mediaUrl,
        camera.subPath,
    );

    return (
        <CameraTileView
            name={camera.name}
            status={status}
            shortcut={shortcut}
            onOpen={onOpen}
            onReconnect={reconnect}
            onResume={() => void videoRef.current?.play()}
        >
            <video
                ref={videoRef}
                aria-label={`Video en vivo de ${camera.name}`}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 size-full object-contain"
            />
        </CameraTileView>
    );
}
