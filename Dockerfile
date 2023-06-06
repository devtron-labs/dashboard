FROM node:16.20.0-alpine3.18 AS builder

WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install --network-timeout 600000

COPY src/ src
COPY types/ types
COPY nginx.conf .
COPY public/ public/
COPY tsconfig.json .
COPY . .
RUN echo REACT_APP_GIT_SHA=`git rev-parse --short HEAD` >> .env.production
RUN echo `git rev-parse --short HEAD` > health.html
RUN npm run build
#RUN apt update -y && apt install jq -y
#RUN python linter.py | jq -C --tab .

FROM nginx:1.25

RUN useradd -ms /bin/bash devtron
COPY --from=builder /app/build/ /usr/share/nginx/html
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
