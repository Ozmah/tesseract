import { expect, test } from 'bun:test';

const image = process.env.TEST_DOCKER_IMAGE ?? 'tesseract-production:local';

async function docker(...args: string[]) {
    const child = Bun.spawn(['docker', ...args], { stdout: 'pipe', stderr: 'pipe' });
    const [stdout, stderr, exitCode] = await Promise.all([
        new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
    ]);
    return { stdout, stderr, exitCode };
}

test('production entrypoint refuses to boot without a Doppler token', async () => {
    const result = await docker('run', '--rm', '-e', 'APP_ENV=local', image);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('DOPPLER_TOKEN must be injected by the host');
});

test('production excludes local credentials and development tooling', async () => {
    const result = await docker('run', '--rm', '--entrypoint', 'sh', image, '-c',
        'test "$(id -u)" != 0 && ! command -v composer && ! command -v node && test ! -e /app/.env.local && test ! -e /app/.env.bootstrap.schema && test ! -d /app/vendor/pestphp');
    expect(result.exitCode).toBe(0);
});
