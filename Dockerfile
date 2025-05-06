FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock .

RUN apk add --no-cache git && \
    yarn install --network-timeout 600000

COPY . .

RUN echo `git rev-parse --short HEAD` > health.html && \
    echo "SENTRY_RELEASE_VERSION=dashboard@$(git rev-parse --short HEAD)" >> .env && \
    yarn build

FROM fholzer/nginx-brotli:v1.26.2

# Install bash
RUN apk add --no-cache bash shadow

RUN useradd -m -s /bin/bash devtron

COPY --from=builder /app/dist/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./nginx-default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html


COPY --from=builder /app/env.sh .
COPY --from=builder /app/.env .
COPY --from=builder /app/health.html .

RUN chown -R devtron:devtron /usr/share/nginx/html && \
    chmod +x env.sh

USER devtron

# Override the default ENTRYPOINT to allow shell scripting as fholzer/nginx-brotli has by-default entrypoint of nginx
ENTRYPOINT ["/bin/bash", "-c"]

CMD ["./env.sh && nginx -g 'daemon off;'"]