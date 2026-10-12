import { afterEach, beforeEach, expect, mock, test } from 'bun:test';
import { rejects } from 'node:assert/strict';
import { WhepSession } from '../../resources/js/lib/whep-client';

const originalPeer = globalThis.RTCPeerConnection;
const originalFetch = globalThis.fetch;
let peers: FakePeer[];
let calls: { url: string; method: string }[];

class FakePeer extends EventTarget {
    public iceGatheringState = 'complete';
    public connectionState = 'new';
    public localDescription: RTCSessionDescriptionInit | null = null;
    public remoteDescription: RTCSessionDescriptionInit | null = null;
    public ontrack: ((event: RTCTrackEvent) => void) | null = null;
    public onconnectionstatechange: (() => void) | null = null;
    public transceivers: string[] = [];
    public track = { stop: mock(() => {}) };

    public constructor() { super(); peers.push(this); }
    public addTransceiver(kind: string) { this.transceivers.push(kind); }
    public async createOffer(): Promise<RTCSessionDescriptionInit> { return { type: 'offer', sdp: 'complete-offer' }; }
    public async setLocalDescription(description: RTCSessionDescriptionInit) { this.localDescription = description; }
    public async setRemoteDescription(description: RTCSessionDescriptionInit) { this.remoteDescription = description; }
    public getReceivers() { return [{ track: this.track }]; }
    public close() { this.connectionState = 'closed'; this.onconnectionstatechange?.(); }
}

beforeEach(() => {
    peers = [];
    calls = [];
    globalThis.RTCPeerConnection = FakePeer as unknown as typeof RTCPeerConnection;
    globalThis.fetch = mock(async (input, init) => {
        calls.push({ url: String(input), method: init?.method ?? 'GET' });
        return init?.method === 'POST'
            ? new Response('answer', { status: 201, headers: { Location: '/tars/whep/test-session' } })
            : new Response('{}');
    }) as unknown as typeof fetch;
});

afterEach(() => {
    globalThis.RTCPeerConnection = originalPeer;
    globalThis.fetch = originalFetch;
});

const endpoint = new URL('http://media.test:8889/tars/whep');

test('negotiates video only and deletes the WHEP session when closed', async () => {
    const failure = mock(() => {});
    const session = new WhepSession(endpoint, { onTrack: () => {}, onFailure: failure });
    await session.start();
    expect(peers[0]!.transceivers).toEqual(['video']);
    expect(peers[0]!.remoteDescription).toEqual({ type: 'answer', sdp: 'answer' });
    session.close();
    session.close();
    expect(calls).toEqual([
        { url: endpoint.href, method: 'POST' },
        { url: 'http://media.test:8889/tars/whep/test-session', method: 'DELETE' },
    ]);
    expect(peers[0]!.track.stop).toHaveBeenCalledTimes(1);
    expect(failure).not.toHaveBeenCalled();
});

for (const location of ['http://other.test/tars/whep/session', '/admin/delete', 'http://user:secret@media.test:8889/tars/whep/session']) {
    test(`refuses a session location outside its WHEP endpoint: ${location}`, async () => {
        globalThis.fetch = mock(async () => new Response('answer', { status: 201, headers: { Location: location } })) as unknown as typeof fetch;
        const session = new WhepSession(endpoint, { onTrack: () => {}, onFailure: () => {} });
        await rejects(session.start(), /Invalid WHEP session location/);
        expect(peers[0]!.remoteDescription).toBeNull();
        session.close();
    });
}

test('reports unavailable streams without installing an SDP answer', async () => {
    globalThis.fetch = mock(async () => new Response('{}', { status: 404 })) as unknown as typeof fetch;
    const session = new WhepSession(endpoint, { onTrack: () => {}, onFailure: () => {} });
    await rejects(session.start(), /WHEP negotiation failed/);
    expect(peers[0]!.remoteDescription).toBeNull();
    session.close();
});

test('reports a failed peer connection but ignores events after close', async () => {
    const failure = mock(() => {});
    const session = new WhepSession(endpoint, { onTrack: () => {}, onFailure: failure });
    peers[0]!.connectionState = 'failed';
    peers[0]!.onconnectionstatechange?.();
    expect(failure).toHaveBeenCalledTimes(1);
    session.close();
    expect(failure).toHaveBeenCalledTimes(1);
});

test('refuses credentials in the browser-facing endpoint before allocating a peer', () => {
    expect(() => new WhepSession(new URL('http://user:secret@media.test/tars/whep'), {
        onTrack: () => {}, onFailure: () => {},
    })).toThrow('Invalid WHEP endpoint');
    expect(peers).toHaveLength(0);
});

test('cancels ICE gathering without sending an offer after close', async () => {
    const session = new WhepSession(endpoint, { onTrack: () => {}, onFailure: () => {} });
    peers[0]!.iceGatheringState = 'gathering';
    const started = session.start();
    const cancelled = rejects(started, /WHEP negotiation cancelled/);
    await Promise.resolve();
    await Promise.resolve();
    session.close();
    await cancelled;
    expect(calls).toEqual([]);
});

test('cleans a late session response without installing an answer after close', async () => {
    let respond: (response: Response) => void = () => {};
    let posted: () => void = () => {};
    const postSent = new Promise<void>((resolve) => { posted = resolve; });
    const pendingResponse = new Promise<Response>((resolve) => { respond = resolve; });
    globalThis.fetch = mock(async (input, init) => {
        calls.push({ url: String(input), method: init?.method ?? 'GET' });
        if (init?.method === 'POST') {
            posted();
            return await pendingResponse;
        }
        return new Response('{}');
    }) as unknown as typeof fetch;
    const session = new WhepSession(endpoint, { onTrack: () => {}, onFailure: () => {} });
    const started = session.start();
    await postSent;
    session.close();
    respond(new Response('answer', { status: 201, headers: { Location: '/tars/whep/late-session' } }));
    await started;
    expect(peers[0]!.remoteDescription).toBeNull();
    expect(calls.at(-1)).toEqual({ url: 'http://media.test:8889/tars/whep/late-session', method: 'DELETE' });
});
