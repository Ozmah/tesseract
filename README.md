# Tesseract

TBD

## Local installation

Requirements: Bun 1.4.2+, Docker with Compose, and access to Doppler (`tesseract/local`, with `APP_KEY` configured).

From the repository root:

```bash
bun run docker:prepare
```

Copy `.env.local.example` to `.env.local` if it does not already exist, then run:

```bash
bun run env:unlock
```

Enter the Doppler service token at the local prompt. Varlock encrypts it; do not commit it or copy `APP_KEY` into local files.

Start the environment, then Vite:

```bash
bun run env:up
bun run dev
```

Open http://localhost:8000. Laravel runs in Docker; Vite runs locally on port 5173 with HMR. PHP and Composer are not required on the host.

Stopping `dev` shuts down Vite but leaves Laravel running. To view logs or stop the environment without deleting data:

```bash
bun run env:logs
bun run env:down
```

## License

[MIT](https://opensource.org/licenses/MIT).
