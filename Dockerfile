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

FROM nginx:stable

RUN apt-get update 
RUN apt install brotli
RUN useradd -ms /bin/bash devtron
COPY --from=builder /app/dist/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./nginx-default.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
COPY --from=builder  /app/./env.sh .
COPY --from=builder  /app/.env .
COPY --from=builder  /app/health.html .

RUN chown -R devtron:devtron /usr/share/nginx/html
# Make our shell script executable
RUN chmod +x env.sh
USER devtron
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
