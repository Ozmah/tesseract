#!/bin/sh
set -eu

: "${APP_ENV:?APP_ENV must select local or production}"
: "${DOPPLER_TOKEN:?DOPPLER_TOKEN must be injected by the host}"

cd /app
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache

if [ "$#" -eq 0 ]; then
    set -- frankenphp run --config /etc/caddy/Caddyfile
fi

exec bun --no-env-file /app/node_modules/varlock/bin/cli.js run \
    --path /app/.env.schema --inject vars -- "$@"
