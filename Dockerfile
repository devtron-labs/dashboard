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

ARG BROTLI_VERSION=master

RUN apt-get update \
    && apt-get install -y \
        build-essential \
        libpcre++-dev \
        zlib1g-dev \
        libgeoip-dev \
        wget \
        git

RUN cd /opt \
    && git clone --depth 1 -b $BROTLI_VERSION --single-branch https://github.com/google/ngx_brotli.git \
    && cd /opt/ngx_brotli \
    && git submodule update --init \
    && cd /opt \
    && wget -O - http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz | tar zxfv - \
    && mv /opt/nginx-$NGINX_VERSION /opt/nginx \
    && cd /opt/nginx \
    && ./configure --with-compat --add-dynamic-module=/opt/ngx_brotli \
    && make modules 

COPY --from=0 /opt/nginx/objs/ngx_http_brotli_filter_module.so /usr/lib/nginx/modules
COPY --from=0 /opt/nginx/objs/ngx_http_brotli_static_module.so /usr/lib/nginx/modules

RUN chmod -R 644 \
        /usr/lib/nginx/modules/ngx_http_brotli_filter_module.so \
        /usr/lib/nginx/modules/ngx_http_brotli_static_module.so 
        
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
