# syntax=docker/dockerfile:1
FROM dunglas/frankenphp:1.13.0-php8.5-bookworm AS runtime

RUN install-php-extensions intl mbstring pcntl pdo_sqlite zip \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && groupadd --gid 1000 tesseract \
    && useradd --uid 1000 --gid tesseract --create-home tesseract \
    && setcap -r /usr/local/bin/frankenphp \
    && mkdir -p /app /app-data /data/caddy /config/caddy \
    && chown -R tesseract:tesseract /app /app-data /data /config

COPY --from=oven/bun:1.4.2-debian /usr/local/bin/bun /usr/local/bin/bun
ENV HOME=/home/tesseract
WORKDIR /app

FROM runtime AS toolchain
RUN apt-get update && apt-get install -y --no-install-recommends git unzip \
    && rm -rf /var/lib/apt/lists/* \
    && install-php-extensions sockets pcov \
    && printf 'zend.assertions=1\n' > "$PHP_INI_DIR/conf.d/development.ini"
COPY --from=composer:2.10.3 /usr/bin/composer /usr/local/bin/composer
COPY --from=node:24-bookworm-slim /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx
USER tesseract
ENTRYPOINT []

FROM toolchain AS build
COPY --chown=tesseract:tesseract . .
RUN composer install --no-interaction --prefer-dist --no-scripts \
    && composer run-script post-autoload-dump
RUN bun install --frozen-lockfile && bun run build:assets

FROM build AS development
USER root
RUN bun node_modules/playwright/cli.js install-deps chromium
USER tesseract
RUN bun node_modules/playwright/cli.js install chromium
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 8000
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl --fail --silent http://127.0.0.1:8000/up >/dev/null || exit 1

FROM build AS production-dependencies
RUN composer install --no-dev --no-interaction --prefer-dist --no-scripts --classmap-authoritative \
    && composer run-script post-autoload-dump \
    && rm -rf node_modules \
    && bun install --production --frozen-lockfile

FROM runtime AS production
COPY --from=production-dependencies --chown=tesseract:tesseract /app /app
COPY Caddyfile /etc/caddy/Caddyfile
USER tesseract
EXPOSE 8000
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl --fail --silent http://127.0.0.1:8000/up >/dev/null || exit 1
