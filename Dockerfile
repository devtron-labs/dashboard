FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json .
COPY yarn.lock .

RUN yarn install --network-timeout 600000

COPY . .

RUN echo `git rev-parse --short HEAD` > health.html
RUN yarn build

FROM nginx:stable

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
