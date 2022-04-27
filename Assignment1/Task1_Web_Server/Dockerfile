FROM ubuntu:22.04

# Install Apache and PHP
ARG DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y apache2 libapache2-mod-php

# Copy config file
COPY cgi_php.conf /etc/apache2/sites-available/cgi_php.conf
# Enable site
RUN ln -s /etc/apache2/sites-available/cgi_php.conf /etc/apache2/sites-enabled/cgi_php.conf

# Enable apache modules for php + cgi
RUN a2enmod cgi php8.1

# Copy html, php, cgi example
COPY hello.html /var/www/html
COPY hello_php.php /var/www/html
COPY hello_cgi.pl /usr/lib/cgi-bin

EXPOSE 80
CMD apachectl -D FOREGROUND

# Run with e.g.
# docker build -t apache . && docker run -it --rm -p 8080:80 apache
# and verify functionality:
# http://localhost:8080/cgi-bin/hello_cgi.pl
# http://localhost:8080/hello_php.php
# http://localhost:8080/hello.html
