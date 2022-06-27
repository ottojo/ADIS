FROM ubuntu:22.04

# Install prerequisites
ARG DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y gpg ca-certificates

# Install k6 as described on the website
RUN gpg -k
RUN gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
RUN echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" > /etc/apt/sources.list.d/k6.list
RUN apt update && apt install -y k6

# Change into root folder and start console
WORKDIR /root
ENTRYPOINT /bin/bash

