FROM node:20-alpine AS builder

RUN apk add --no-cache git

ARG SHOULD_LINK_COMMON_LIB=false

WORKDIR /app
COPY package.json .
COPY yarn.lock .
COPY ./patches ./patches

RUN yarn global add yalc
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY . .

# Only meant for local development
# Ensure to use npm repo for production environment
RUN if [ "$SHOULD_LINK_COMMON_LIB" = "true" ]; then \
      cp -r ./devtron-fe-common-lib /devtron-fe-common-lib && \
      cd /devtron-fe-common-lib && \
      npm ci && \
      npm run build-lib && \
      yalc push --sig && \
      cd /app && \
      yalc link @devtron-labs/devtron-fe-common-lib \
    else \
      echo "Skipping linking common lib as SHOULD_LINK_COMMON_LIB is false"; \
    fi

COPY /devtron-fe-lib /devtron-fe-lib
RUN cd /devtron-fe-lib && \
    npm ci && \
    npm run build-lib && \
    yalc push --sig && \
    cd /app

RUN echo "SENTRY_RELEASE_VERSION=dashboard@$(git rev-parse --short=9 HEAD)\n" >> .env

RUN yalc link @devtron-labs/devtron-fe-lib
RUN yarn build

RUN yalc remove --all

FROM nginx:stable

RUN useradd -ms /bin/bash devtron
COPY --from=builder /app/dist/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./nginx-default.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
COPY --from=builder  /app/./env.sh .
COPY --from=builder  /app/.env .

RUN chown -R devtron:devtron /usr/share/nginx/html
# Make our shell script executable
RUN chmod +x env.sh
USER devtron
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]