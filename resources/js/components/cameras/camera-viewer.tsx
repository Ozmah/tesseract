import { cn } from 'cn';
import { useEffect, useEffectEvent } from 'react';
import { CameraStage } from '@/components/cameras/camera-stage';
import { CameraTile } from '@/components/cameras/camera-tile';
import { hasShortcutModifier, isTypingTarget } from '@/lib/keyboard';
import type { Camera } from '@/types';

type CameraViewerProps = {
    cameras: Camera[];
    mediaUrl: string;
    selectedSlug: string | null;
    onSelect: (slug: string | null) => void;
    layout?: 'embedded' | 'page';
    className?: string;
};

/**
 * Multi-camera grid (substreams) that opens one camera at a time in the
 * stage (main stream). Only the visible view keeps connections open: the
 * grid unmounts while a camera is open, so the other cameras disconnect.
 *
 * Number keys 1–9 open a camera from the grid. In the page layout the
 * open camera covers the whole viewport.
 */
export function CameraViewer({
    cameras,
    mediaUrl,
    selectedSlug,
    onSelect,
    layout = 'embedded',
    className,
}: CameraViewerProps) {
    const selected = cameras.find(({ slug }) => slug === selectedSlug) ?? null;

    const handleShortcut = useEffectEvent((event: KeyboardEvent) => {
        if (selected || isTypingTarget(event) || hasShortcutModifier(event)) {
            return;
        }

        const camera = cameras[Number(event.key) - 1];

        if (/^[1-9]$/.test(event.key) && camera) {
            event.preventDefault();
            onSelect(camera.slug);
        }
    });

    useEffect(() => {
        const keydown = (event: KeyboardEvent) => handleShortcut(event);

        window.addEventListener('keydown', keydown);

        return () => window.removeEventListener('keydown', keydown);
    }, []);

    if (selected) {
        return (
            <CameraStage
                key={selected.slug}
                camera={selected}
                mediaUrl={mediaUrl}
                onClose={() => onSelect(null)}
                fill={layout === 'page'}
                className={cn(
                    layout === 'page' && 'fixed inset-0 z-50 h-dvh w-full',
                    className,
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                'grid gap-px bg-border',
                cameras.length > 1 && 'md:grid-cols-2',
                className,
            )}
        >
            {cameras.map((camera, index) => (
                <CameraTile
                    key={camera.slug}
                    camera={camera}
                    mediaUrl={mediaUrl}
                    shortcut={index < 9 ? String(index + 1) : undefined}
                    onOpen={() => onSelect(camera.slug)}
                />
            ))}
        </div>
    );
}
