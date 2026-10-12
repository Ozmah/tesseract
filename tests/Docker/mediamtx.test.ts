import { expect, test } from 'bun:test';
import { randomUUID } from 'node:crypto';
import { connect } from 'node:net';
import { resolve } from 'node:path';

async function docker(...args: string[]) {
    const child = Bun.spawn(['docker', ...args], { stdout: 'pipe', stderr: 'pipe' });
    const [stdout, stderr, exitCode] = await Promise.all([
        new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
    ]);
    return { stdout, stderr, exitCode };
}

async function request(port: number, message: string): Promise<string> {
    return await new Promise((resolveResponse, reject) => {
        const socket = connect({ host: '127.0.0.1', port });
        socket.setTimeout(5000);
        socket.once('connect', () => socket.write(message));
        socket.once('data', (data) => {
            resolveResponse(data.toString());
            socket.destroy();
        });
        socket.once('error', reject);
        socket.once('timeout', () => socket.destroy(new Error('RTSP request timed out')));
        socket.once('end', () => reject(new Error('RTSP connection closed without a response')));
    });
}

test('MediaMTX starts with camera sources and refuses anonymous publishers', async () => {
    const name = `tesseract-mediamtx-test-${randomUUID()}`;
    try {
        const result = await docker('run', '-d', '--name', name,
            '--read-only', '--user', '1000:1000', '--cap-drop', 'ALL',
            '--security-opt', 'no-new-privileges:true',
            '-p', '127.0.0.1::8554',
            '-v', `${resolve(import.meta.dirname, '../../mediamtx.yml')}:/mediamtx.yml:ro`,
            ...['TARS', 'TARS-SUB', 'CASE', 'CASE-SUB'].flatMap((path) => [
                '-e', `MTX_PATHS_${path}_SOURCE=rtsp://127.0.0.1:1/unavailable`,
            ]),
            'bluenviron/mediamtx:1.21.2');
        expect(result.exitCode).toBe(0);

        const mapping = await docker('port', name, '8554/tcp');
        expect(mapping.exitCode).toBe(0);
        const port = Number(mapping.stdout.trim().split(':').at(-1));
        const url = `rtsp://127.0.0.1:${port}/tars`;
        let ready = false;
        for (let attempt = 0; attempt < 30; attempt++) {
            try {
                const response = await request(port, `OPTIONS ${url} RTSP/1.0\r\nCSeq: 1\r\n\r\n`);
                ready = response.startsWith('RTSP/1.0 200');
                if (ready) break;
            } catch {
                // Docker's published port can precede the server's listener.
            }
            await Bun.sleep(100);
        }
        expect(ready).toBe(true);

        const sdp = 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=Test\r\nc=IN IP4 127.0.0.1\r\nt=0 0\r\nm=video 0 RTP/AVP 96\r\na=rtpmap:96 H264/90000\r\na=control:trackID=0\r\n';
        const response = await request(port,
            `ANNOUNCE ${url} RTSP/1.0\r\nCSeq: 1\r\nContent-Type: application/sdp\r\nContent-Length: ${Buffer.byteLength(sdp)}\r\n\r\n${sdp}`);
        expect(response).toStartWith('RTSP/1.0 401');
    } finally {
        await docker('rm', '-f', name);
    }
}, 20000);
