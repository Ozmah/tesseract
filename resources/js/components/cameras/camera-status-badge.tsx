import type { Icon } from '@phosphor-icons/react';
import {
    ArrowClockwiseIcon,
    PauseIcon,
    SpinnerIcon,
    XCircleIcon,
} from '@phosphor-icons/react';
import { cn } from 'cn';
import type { StreamStatus } from '@/types';

type StatusPresentation = {
    label: string;
    icon: Icon | null;
    className: string;
};

export const streamStatusPresentation: Record<
    StreamStatus,
    StatusPresentation
> = {
    playing: { label: 'En vivo', icon: null, className: 'text-status-live' },
    connecting: {
        label: 'Conectando',
        icon: SpinnerIcon,
        className: 'text-status-info',
    },
    retrying: {
        label: 'Reconectando',
        icon: ArrowClockwiseIcon,
        className: 'text-status-warn',
    },
    paused: {
        label: 'Pausado',
        icon: PauseIcon,
        className: 'text-status-muted',
    },
    unsupported: {
        label: 'Sin WebRTC',
        icon: XCircleIcon,
        className: 'text-status-error',
    },
};

export function CameraStatusBadge({
    status,
    className,
}: {
    status: StreamStatus;
    className?: string;
}) {
    const {
        label,
        icon: StatusIcon,
        className: tone,
    } = streamStatusPresentation[status];

    return (
        <span
            role="status"
            className={cn(
                'inline-flex items-center gap-1.5 bg-video-overlay px-2 py-1 text-[0.6875rem] font-semibold tracking-widest uppercase',
                tone,
                className,
            )}
        >
            {StatusIcon ? (
                <StatusIcon
                    aria-hidden="true"
                    weight="bold"
                    className={cn(
                        'size-3.5',
                        status === 'connecting' && 'animate-spin',
                    )}
                />
            ) : (
                <span
                    aria-hidden="true"
                    className="size-2 animate-pulse rounded-full bg-status-live motion-reduce:animate-none"
                />
            )}
            {label}
        </span>
    );
}
