import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const token = 'dp.st.tesseract-contract-test-not-a-real-token';
const appKey = `base64:${Buffer.alloc(32, 1).toString('base64')}`;
let fixture: string;

beforeAll(async () => {
    const temporaryRoot = join(tmpdir(), 'opencode');
    await mkdir(temporaryRoot, { recursive: true });
    fixture = await mkdtemp(join(temporaryRoot, 'tesseract-env-'));
    await symlink(join(root, 'node_modules'), join(fixture, 'node_modules'));
    for (const file of ['.env.schema', '.env.bootstrap.schema']) {
        await writeFile(join(fixture, file), await readFile(join(root, file)));
    }
    await writeFile(join(fixture, '.env.local'), `DOPPLER_TOKEN=${token}\nAPP_KEY=must-not-be-imported\n`);
    await writeFile(join(fixture, '.env'), 'APP_KEY=must-not-be-loaded\n');
    await writeFile(join(fixture, 'mock-doppler.mjs'), `
globalThis.fetch = async (input, options) => {
    if (process.env.CONTRACT_OFFLINE) throw new Error('Doppler unavailable');
    const request = new Request(input, options);
    const url = new URL(request.url);
    if (url.origin !== 'https://api.doppler.com' ||
        url.pathname !== '/v3/configs/config/secrets' ||
        url.searchParams.get('project') !== 'tesseract' ||
        url.searchParams.get('config') !== process.env.CONTRACT_ENV ||
        request.headers.get('authorization') !== 'Bearer ${token}') {
        throw new Error('Unexpected network request');
    }
    const values = {
        APP_KEY: '${appKey}',
        APP_ENV: 'untrusted',
        DOPPLER_TOKEN: 'untrusted-remote-token',
        UNDECLARED_SECRET: 'must-not-be-injected',
    };
    if (process.env.CONTRACT_MISSING_KEY) delete values.APP_KEY;
    return Response.json({ secrets: Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, { computed: value }])
    ) });
};
`);
});

afterAll(async () => {
    if (fixture) await rm(fixture, { recursive: true, force: true });
});

async function cli(
    args: string[],
    options: { bootstrap?: boolean; appEnv?: string; missingKey?: boolean; missingToken?: boolean; offline?: boolean } = {},
) {
    const appEnv = options.appEnv ?? 'local';
    const child = Bun.spawn([
        process.execPath, '--no-env-file', '--preload', join(fixture, 'mock-doppler.mjs'),
        join(root, 'node_modules/varlock/bin/cli.js'), args[0]!,
        '--path', join(fixture, options.bootstrap ? '.env.bootstrap.schema' : '.env.schema'),
        ...args.slice(1),
    ], {
        cwd: fixture,
        env: {
            PATH: process.env.PATH,
            HOME: fixture,
            APP_ENV: appEnv,
            CONTRACT_ENV: appEnv,
            ...(!options.bootstrap && !options.missingToken ? { DOPPLER_TOKEN: token } : {}),
            ...(options.missingKey ? { CONTRACT_MISSING_KEY: '1' } : {}),
            ...(options.offline ? { CONTRACT_OFFLINE: '1' } : {}),
        },
        stdout: 'pipe',
        stderr: 'pipe',
    });
    const [stdout, stderr, exitCode] = await Promise.all([
        new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
    ]);
    return { stdout, stderr, exitCode };
}

describe('Doppler runtime contract', () => {
    for (const appEnv of ['local', 'production']) {
        test(`uses the ${appEnv} config and redacts credentials`, async () => {
            const result = await cli(['load', '--agent'], { appEnv });
            expect(result.exitCode).toBe(0);
            const env = JSON.parse(result.stdout);
            expect(env.APP_ENV).toBe(appEnv);
            expect(env.SESSION_SECURE_COOKIE).toBe(appEnv === 'production');
            expect(env.UNDECLARED_SECRET).toBeUndefined();
            expect(result.stdout + result.stderr).not.toContain(appKey);
            expect(result.stdout + result.stderr).not.toContain(token);
        });
    }

    test('fails closed without APP_KEY', async () => {
        expect((await cli(['load', '--agent'], { missingKey: true })).exitCode).not.toBe(0);
    });

    test('does not import the local token inside the runtime schema', async () => {
        expect((await cli(['load', '--agent'], { missingToken: true })).exitCode).not.toBe(0);
    });

    test('rejects unknown environments', async () => {
        expect((await cli(['load', '--agent'], { appEnv: 'staging' })).exitCode).not.toBe(0);
    });

    test('fails closed if Doppler is unavailable', async () => {
        expect((await cli(['load', '--agent'], { offline: true })).exitCode).not.toBe(0);
    });

    test('the secret scanner detects a resolved Doppler value in a file', async () => {
        const target = join(fixture, 'accidental-leak.txt');
        await writeFile(target, `An accidental credential: ${appKey}`);
        const result = await cli(['scan', target]);
        expect(result.exitCode).not.toBe(0);
        expect(result.stdout + result.stderr).toContain('APP_KEY');
        await rm(target);
    });

    test('passes APP_KEY but strips the token and metadata from Laravel children', async () => {
        const result = await cli(['run', '--inject', 'vars', '--', process.execPath, '--no-env-file', '-e', `
console.log(JSON.stringify({
    keyMatches: process.env.APP_KEY === '${appKey}',
    hasToken: 'DOPPLER_TOKEN' in process.env,
    hasMetadata: '__VARLOCK_ENV' in process.env,
    hasUnknown: 'UNDECLARED_SECRET' in process.env,
}));`]);
        expect(result.exitCode).toBe(0);
        expect(JSON.parse(result.stdout)).toEqual({
            keyMatches: true, hasToken: false, hasMetadata: false, hasUnknown: false,
        });
    });
});

test('host bootstrap imports only the token, forwards it to Compose and never contacts Doppler', async () => {
    const result = await cli(['run', '--inject', 'vars', '--', process.execPath, '--no-env-file', '-e', `
console.log(JSON.stringify({
    tokenMatches: process.env.DOPPLER_TOKEN === '${token}',
    appEnv: process.env.APP_ENV,
    hasKey: 'APP_KEY' in process.env,
    hasMetadata: '__VARLOCK_ENV' in process.env,
}));`], { bootstrap: true, offline: true });
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
        tokenMatches: true, appEnv: 'local', hasKey: false, hasMetadata: false,
    });
});
