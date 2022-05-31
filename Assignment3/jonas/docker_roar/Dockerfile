FROM ubuntu:22.04

ENV TZ=Europe/Berlin
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y python3-pip python3-venv tzdata

COPY run.sh /run.sh
