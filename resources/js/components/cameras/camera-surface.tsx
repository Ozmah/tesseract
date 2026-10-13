import {
    ArrowClockwiseIcon,
    PlayIcon,
    WarningCircleIcon,
} from '@phosphor-icons/react';
import { cn } from 'cn';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { StreamStatus } from '@/types';

type CameraSurfaceProps = {
    status: StreamStatus;
    onReconnect?: () => void;
    onResume?: () => void;
    className?: string;
    children: ReactNode;
};

/**
 * Video frame shared by every camera view. Renders the video (children)
 * and, when the stream is not playing, a centered explanation with the
 * action that recovers it.
 */
export function CameraSurface({
    status,
    onReconnect,
    onResume,
    className,
    children,
}: CameraSurfaceProps) {
    return (
        <div
            className={cn(
                'relative isolate overflow-hidden bg-video-surface text-video-overlay-foreground',
                className,
            )}
        >
            {children}

            {status !== 'playing' && (
                <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-video-overlay p-4 text-center *:pointer-events-auto">
                    {status === 'connecting' && (
                        <>
                            <Spinner className="size-6 text-status-info" />
                            <p className="text-sm">Conectando…</p>
                        </>
                    )}
                    {status === 'retrying' && (
                        <>
                            <WarningCircleIcon
                                aria-hidden="true"
                                className="size-6 text-status-warn"
                            />
                            <p className="text-sm">
                                Sin señal. Reintentando automáticamente.
                            </p>
                            {onReconnect && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={onReconnect}
                                >
                                    <ArrowClockwiseIcon data-icon="inline-start" />
                                    Reintentar ahora
                                </Button>
                            )}
                        </>
                    )}
                    {status === 'paused' && onResume && (
                        <Button size="lg" onClick={onResume}>
                            <PlayIcon data-icon="inline-start" weight="fill" />
                            Reproducir
                        </Button>
                    )}
                    {status === 'unsupported' && (
                        <>
                            <WarningCircleIcon
                                aria-hidden="true"
                                className="size-6 text-status-error"
                            />
                            <p className="max-w-xs text-sm">
                                Este navegador no permite reproducir video por
                                WebRTC en esta dirección.
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
