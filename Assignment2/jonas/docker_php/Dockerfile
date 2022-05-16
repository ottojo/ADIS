FROM ubuntu:22.04

# Install Apache and PHP
ARG DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y apache2 libapache2-mod-php php8.1-sqlite3

# Copy config file
COPY cgi_php.conf /etc/apache2/sites-available/cgi_php.conf
RUN ln -s /etc/apache2/sites-available/cgi_php.conf /etc/apache2/sites-enabled/cgi_php.conf

RUN a2enmod php8.1

EXPOSE 80
CMD ["apachectl", "-D", "FOREGROUND"]
