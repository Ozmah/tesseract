import { expect, test } from 'bun:test';
import {
    constrainZoom,
    IDENTITY_ZOOM,
    MAX_ZOOM,
    panBy,
    zoomAt,
} from '../../resources/js/lib/digital-zoom';

const viewport = { width: 800, height: 450 };

test('zooming keeps the point under the cursor fixed', () => {
    const zoomed = zoomAt(IDENTITY_ZOOM, 2, 200, 100, viewport);

    expect(zoomed).toEqual({ scale: 2, x: -200, y: -100 });
    expect((200 - zoomed.x) / zoomed.scale).toBe(200);
    expect((100 - zoomed.y) / zoomed.scale).toBe(100);
});

test('scale is clamped between 1x and the maximum', () => {
    expect(zoomAt(IDENTITY_ZOOM, 0.5, 400, 225, viewport)).toEqual(IDENTITY_ZOOM);
    expect(zoomAt(IDENTITY_ZOOM, 20, 0, 0, viewport).scale).toBe(MAX_ZOOM);
});

test('zooming back to 1x recenters the content', () => {
    const zoomed = zoomAt(IDENTITY_ZOOM, 4, 700, 400, viewport);

    expect(zoomAt(zoomed, 1, 100, 50, viewport)).toEqual(IDENTITY_ZOOM);
});

test('panning never reveals space outside the video', () => {
    const zoomed = zoomAt(IDENTITY_ZOOM, 2, 400, 225, viewport);

    expect(panBy(zoomed, 10000, 10000, viewport)).toEqual({ scale: 2, x: 0, y: 0 });
    expect(panBy(zoomed, -10000, -10000, viewport)).toEqual({ scale: 2, x: -800, y: -450 });
});

test('panning at 1x has no effect', () => {
    expect(panBy(IDENTITY_ZOOM, 50, -30, viewport)).toEqual(IDENTITY_ZOOM);
});

test('constraining fixes offsets left by a smaller viewport', () => {
    expect(constrainZoom({ scale: 2, x: -1000, y: 20 }, viewport)).toEqual({ scale: 2, x: -800, y: 0 });
});
