FROM ubuntu:22.04

# 0. Update sources and install curl
ARG DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y curl

# 1. Install node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt install -y nodejs

# 2. Copy Roary files and install dependencies
RUN mkdir -p /roary
COPY node /roary
RUN cd roary && npm install

# 3. Expose port and start the roary app
EXPOSE 3000
CMD cd /roary && npm start

