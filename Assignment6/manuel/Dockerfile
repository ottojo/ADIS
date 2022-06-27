FROM ubuntu:22.04

# 0. Update sources and install curl
ARG DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y curl

# 1. Install nginx and node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt install -y nodejs nginx redis

# 2. Copy Roary files and nginx config
RUN mkdir -p /roary
RUN mkdir -p /var/www/roary-public

COPY node /roary
COPY nginx/roary /etc/nginx/sites-available/roary
COPY node/public /var/www/roary-public

# 3. Setup nginx config
RUN rm /etc/nginx/sites-enabled/*
RUN ln -s /etc/nginx/sites-available/roary /etc/nginx/sites-enabled/roary

# 4. Install dependencies and pm2
RUN cd roary && npm install
RUN npm install -g pm2

# 5. Expose port, start nginx, redis, roary app and open a shell
EXPOSE 80
CMD cd /roary && \
    nginx -c /etc/nginx/nginx.conf && \
    redis-server --daemonize yes && \
    pm2 start process.yml && \
    /bin/bash

