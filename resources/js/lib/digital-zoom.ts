export const MIN_ZOOM = 1;
export const MAX_ZOOM = 8;
export const ZOOM_STEP = 1.5;

/**
 * Zoom applied to content the same size as its viewport, with
 * transform-origin at the top-left corner: translate(x, y) scale(scale).
 */
export type ZoomState = {
    scale: number;
    x: number;
    y: number;
};

export type Size = {
    width: number;
    height: number;
};

export const IDENTITY_ZOOM: ZoomState = { scale: 1, x: 0, y: 0 };

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/**
 * Keeps the scaled content covering the whole viewport, so panning never
 * reveals empty space around the video.
 */
export function constrainZoom(state: ZoomState, viewport: Size): ZoomState {
    const scale = clamp(state.scale, MIN_ZOOM, MAX_ZOOM);

    return {
        scale,
        x: clamp(state.x, viewport.width * (1 - scale), 0),
        y: clamp(state.y, viewport.height * (1 - scale), 0),
    };
}

/**
 * Changes the scale while keeping the content point under (originX,
 * originY), in viewport coordinates, fixed on screen.
 */
export function zoomAt(
    state: ZoomState,
    scale: number,
    originX: number,
    originY: number,
    viewport: Size,
): ZoomState {
    const nextScale = clamp(scale, MIN_ZOOM, MAX_ZOOM);
    const ratio = nextScale / state.scale;

    return constrainZoom(
        {
            scale: nextScale,
            x: originX - (originX - state.x) * ratio,
            y: originY - (originY - state.y) * ratio,
        },
        viewport,
    );
}

export function panBy(
    state: ZoomState,
    deltaX: number,
    deltaY: number,
    viewport: Size,
): ZoomState {
    return constrainZoom(
        { ...state, x: state.x + deltaX, y: state.y + deltaY },
        viewport,
    );
}
