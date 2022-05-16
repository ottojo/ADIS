FROM ubuntu:22.04

# Install Apache and PHP
ARG DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y apache2 libapache2-mod-php php-sqlite3

# copy roary web files and apache config files
COPY roary /var/www/roary
COPY 001-roary.conf /etc/apache2/sites-available/001-roary.conf

# Own data directories
RUN chown -R www-data:www-data /var/www/roary/data

# Enable apache modules for php + cgi and enable roary site
RUN a2dissite 000-default
RUN a2ensite 001-roary

# Reload apache
RUN apachectl restart

# expose port and put apache in foreground
EXPOSE 80
CMD apachectl -D FOREGROUND

