# Tesseract

TBD

## Local installation

Requirements: Bun 1.4.2+, Docker with Compose, and access to Doppler (`tesseract/local` with `APP_KEY`, and `tesseract/media-local` with the four camera RTSP URLs).

From the repository root:

```bash
bun run docker:prepare
```

Copy `.env.local.example` to `.env.local` if it does not already exist, then run:

```bash
bun run env:unlock
```

Enter the Doppler service token at the local prompt. Varlock encrypts it; do not commit it or copy `APP_KEY` into local files.

Copy `.env.media.local.example` to `.env.media.local`, then enter the read-only `media-local` service token at its separate local prompt:

```bash
bun run env:unlock:media
```

Start the environment, then Vite:

```bash
bun run env:up
bun run dev
```

Open http://localhost:8000. Laravel runs in Docker; Vite runs locally on port 5173 with HMR. PHP and Composer are not required on the host.

The viewer plays TARS and CASE over WebRTC, with independent main/substream selection. Audio and recording are disabled. All published ports are restricted to localhost; LAN access is not enabled yet.

Stopping `dev` shuts down Vite but leaves Laravel running. To view logs or stop the environment without deleting data:

```bash
bun run env:logs
bun run env:down
```

## License

[MIT](https://opensource.org/licenses/MIT).
