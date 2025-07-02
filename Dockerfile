FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable yarn && \
    yarn set version 4.9.2

COPY package.json .
COPY yarn.lock .
COPY .yarn/ .yarn/
COPY .yarnrc.yml ./

RUN apk add --no-cache git
RUN yarn install --immutable --network-timeout 600000

COPY . .

RUN echo `git rev-parse --short=9 HEAD` > health.html && \
    echo "" >> .env && \
    echo "SENTRY_RELEASE_VERSION=dashboard@$(git rev-parse --short=9 HEAD)" >> .env

RUN yarn build

FROM fholzer/nginx-brotli:v1.26.2

RUN useradd -ms /bin/bash devtron
COPY --from=builder /app/dist/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./nginx-default.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
COPY --from=builder  /app/./env.sh .
COPY --from=builder  /app/.env .
COPY --from=builder  /app/health.html .

# Make our shell script executable
RUN chown -R devtron:devtron /usr/share/nginx/html && \
    chmod +x env.sh 
USER devtron
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]