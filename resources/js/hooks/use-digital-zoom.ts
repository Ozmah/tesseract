import type { CSSProperties, RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Size, ZoomState } from '@/lib/digital-zoom';
import {
    constrainZoom,
    IDENTITY_ZOOM,
    panBy,
    ZOOM_STEP,
    zoomAt,
} from '@/lib/digital-zoom';

const WHEEL_SENSITIVITY = 0.0015;
const DOUBLE_CLICK_ZOOM = 2.5;

export type DigitalZoom = {
    viewportRef: RefObject<HTMLDivElement | null>;
    zoom: ZoomState;
    isZoomed: boolean;
    contentStyle: CSSProperties;
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
};

type Point = { x: number; y: number };

function distance(first: Point, second: Point): number {
    return Math.hypot(first.x - second.x, first.y - second.y);
}

function midpoint(first: Point, second: Point): Point {
    return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}

/**
 * Digital zoom for the element attached to viewportRef: wheel and buttons
 * zoom, drag pans while zoomed, two pointers pinch, double click toggles.
 * The content keeps covering the viewport at every scale.
 */
export function useDigitalZoom(): DigitalZoom {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState<ZoomState>(IDENTITY_ZOOM);
    const zoomRef = useRef<ZoomState>(IDENTITY_ZOOM);

    const apply = useCallback(
        (update: (current: ZoomState, viewport: Size) => ZoomState) => {
            const viewport = viewportRef.current;
            if (!viewport) return;

            const next = update(zoomRef.current, {
                width: viewport.clientWidth,
                height: viewport.clientHeight,
            });
            zoomRef.current = next;
            setZoom(next);
        },
        [],
    );

    const zoomFromCenter = useCallback(
        (factor: number) =>
            apply((current, viewport) =>
                zoomAt(
                    current,
                    current.scale * factor,
                    viewport.width / 2,
                    viewport.height / 2,
                    viewport,
                ),
            ),
        [apply],
    );

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const pointers = new Map<number, Point>();
        const local = (event: { clientX: number; clientY: number }): Point => {
            const rect = viewport.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            };
        };

        const wheel = (event: WheelEvent) => {
            event.preventDefault();
            const point = local(event);
            apply((current, size) =>
                zoomAt(
                    current,
                    current.scale * Math.exp(-event.deltaY * WHEEL_SENSITIVITY),
                    point.x,
                    point.y,
                    size,
                ),
            );
        };

        const pointerDown = (event: PointerEvent) => {
            viewport.setPointerCapture(event.pointerId);
            pointers.set(event.pointerId, local(event));
        };

        const pointerMove = (event: PointerEvent) => {
            const previous = pointers.get(event.pointerId);
            if (!previous) return;

            const point = local(event);

            if (pointers.size === 1) {
                apply((current, size) =>
                    panBy(
                        current,
                        point.x - previous.x,
                        point.y - previous.y,
                        size,
                    ),
                );
            } else if (pointers.size === 2) {
                const other = [...pointers.entries()].find(
                    ([id]) => id !== event.pointerId,
                )?.[1];

                if (other) {
                    const before = midpoint(previous, other);
                    const after = midpoint(point, other);
                    const ratio =
                        distance(point, other) /
                        Math.max(1, distance(previous, other));

                    apply((current, size) =>
                        panBy(
                            zoomAt(
                                current,
                                current.scale * ratio,
                                before.x,
                                before.y,
                                size,
                            ),
                            after.x - before.x,
                            after.y - before.y,
                            size,
                        ),
                    );
                }
            }

            pointers.set(event.pointerId, point);
        };

        const pointerUp = (event: PointerEvent) => {
            pointers.delete(event.pointerId);
        };

        const doubleClick = (event: MouseEvent) => {
            const point = local(event);
            apply((current, size) =>
                current.scale > 1
                    ? IDENTITY_ZOOM
                    : zoomAt(
                          current,
                          DOUBLE_CLICK_ZOOM,
                          point.x,
                          point.y,
                          size,
                      ),
            );
        };

        const resize = new ResizeObserver(() =>
            apply((current, size) => constrainZoom(current, size)),
        );

        viewport.addEventListener('wheel', wheel, { passive: false });
        viewport.addEventListener('pointerdown', pointerDown);
        viewport.addEventListener('pointermove', pointerMove);
        viewport.addEventListener('pointerup', pointerUp);
        viewport.addEventListener('pointercancel', pointerUp);
        viewport.addEventListener('dblclick', doubleClick);
        resize.observe(viewport);

        return () => {
            viewport.removeEventListener('wheel', wheel);
            viewport.removeEventListener('pointerdown', pointerDown);
            viewport.removeEventListener('pointermove', pointerMove);
            viewport.removeEventListener('pointerup', pointerUp);
            viewport.removeEventListener('pointercancel', pointerUp);
            viewport.removeEventListener('dblclick', doubleClick);
            resize.disconnect();
        };
    }, [apply]);

    return {
        viewportRef,
        zoom,
        isZoomed: zoom.scale > 1,
        contentStyle: {
            transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`,
            transformOrigin: '0 0',
        },
        zoomIn: () => zoomFromCenter(ZOOM_STEP),
        zoomOut: () => zoomFromCenter(1 / ZOOM_STEP),
        reset: () => apply(() => IDENTITY_ZOOM),
    };
}
