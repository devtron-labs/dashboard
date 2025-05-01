FROM node:20-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app
COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile --network-timeout 600000

COPY src/ src
COPY nginx.conf .
COPY tsconfig.json .
COPY vite.config.mts .
COPY . .

RUN echo `git rev-parse --short=9 HEAD` > health.html

RUN echo "SENTRY_RELEASE_VERSION=dashboard@$(git rev-parse --short HEAD)\n" >> .env

RUN yarn build

FROM fholzer/nginx-brotli:v1.26.2

RUN adduser -D -s /bin/sh devtron
COPY --from=builder /app/dist/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./nginx-default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

COPY --from=builder  /app/./env.sh .
COPY --from=builder  /app/.env .
COPY --from=builder  /app/health.html .

RUN chown -R devtron:devtron /usr/share/nginx/html

RUN chmod +x env.sh
USER devtron

# as fholzer/nginx-brotli 's entrypoint is by default nginx
# ENTRYPOINT ["/bin/sh", "-c"]

# CMD ["./env.sh && nginx -g 'daemon off;'"]