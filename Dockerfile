FROM node:20-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app
COPY package.json yarn.lock .

RUN yarn install --network-timeout 600000

COPY . .

RUN echo `git rev-parse --short HEAD` > health.html && \
	echo "SENTRY_RELEASE_VERSION=dashboard@$(git rev-parse --short HEAD)" >> .env && \
	yarn build

FROM nginx:stable-alpine

RUN apk add --no-cache shadow

RUN useradd -ms /bin/bash devtron

COPY --from=builder /app/dist/ /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY ./nginx-default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

COPY --chown=devtron:devtron --from=builder  /app/./env.sh /app/health.html /app/.env .

# Make our shell script executable
RUN chmod +x env.sh

USER devtron

CMD ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
