type WhepOptions = {
    onTrack: (track: MediaStreamTrack) => void;
    onFailure: () => void;
};

// Video-only, non-trickle WHEP: gather ICE before posting the complete offer.
// No SDP rewriting or external STUN/TURN servers are needed on this local network.
export class WhepSession {
    private readonly peer: RTCPeerConnection;
    private readonly controller = new AbortController();
    private sessionUrl: URL | null = null;
    private closed = false;

    public constructor(
        private readonly endpoint: URL,
        private readonly options: WhepOptions,
    ) {
        if (
            !['http:', 'https:'].includes(endpoint.protocol) ||
            endpoint.username ||
            endpoint.password
        ) {
            throw new Error('Invalid WHEP endpoint');
        }
        this.peer = new RTCPeerConnection({ iceServers: [] });
        this.peer.addTransceiver('video', { direction: 'recvonly' });
        this.peer.ontrack = ({ track }) => {
            if (!this.closed) this.options.onTrack(track);
        };
        this.peer.onconnectionstatechange = () => {
            if (
                !this.closed &&
                ['failed', 'closed'].includes(this.peer.connectionState)
            ) {
                this.options.onFailure();
            }
        };
    }

    public async start(): Promise<void> {
        const timeout = setTimeout(() => this.controller.abort(), 15000);
        try {
            await this.peer.setLocalDescription(await this.peer.createOffer());
            await this.waitForIce();
            this.controller.signal.throwIfAborted();

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/sdp',
                    Accept: 'application/sdp',
                },
                body: this.peer.localDescription?.sdp,
                credentials: 'omit',
                redirect: 'error',
                signal: this.controller.signal,
            });
            if (response.status !== 201)
                throw new Error('WHEP negotiation failed');

            const location = response.headers.get('Location');
            if (!location) throw new Error('Missing WHEP session location');
            const sessionUrl = new URL(location, this.endpoint);
            if (
                sessionUrl.origin !== this.endpoint.origin ||
                sessionUrl.username ||
                sessionUrl.password ||
                !sessionUrl.pathname.startsWith(`${this.endpoint.pathname}/`)
            ) {
                throw new Error('Invalid WHEP session location');
            }
            this.sessionUrl = sessionUrl;
            if (this.closed) {
                this.deleteSession();
                return;
            }
            await this.peer.setRemoteDescription({
                type: 'answer',
                sdp: await response.text(),
            });
        } finally {
            clearTimeout(timeout);
        }
    }

    public close(): void {
        if (this.closed) return;
        this.closed = true;
        this.controller.abort();
        for (const receiver of this.peer.getReceivers()) receiver.track.stop();
        this.peer.close();
        this.deleteSession();
    }

    private deleteSession(): void {
        if (!this.sessionUrl) return;
        const url = this.sessionUrl;
        this.sessionUrl = null;
        void fetch(url, {
            method: 'DELETE',
            credentials: 'omit',
            redirect: 'error',
            signal: AbortSignal.timeout(5000),
            keepalive: true,
        }).catch(() => {
            // Closing the peer also terminates media if the server is unavailable.
        });
    }

    private async waitForIce(): Promise<void> {
        if (this.peer.iceGatheringState === 'complete') return;
        await new Promise<void>((resolve, reject) => {
            const cleanup = () => {
                this.peer.removeEventListener(
                    'icegatheringstatechange',
                    changed,
                );
                this.controller.signal.removeEventListener('abort', aborted);
            };
            const changed = () => {
                if (this.peer.iceGatheringState === 'complete') {
                    cleanup();
                    resolve();
                }
            };
            const aborted = () => {
                cleanup();
                reject(new Error('WHEP negotiation cancelled'));
            };
            this.peer.addEventListener('icegatheringstatechange', changed);
            this.controller.signal.addEventListener('abort', aborted, {
                once: true,
            });
            if (this.controller.signal.aborted) aborted();
            else changed();
        });
    }
}
