# Assignment 2, all tasks

### Docker setup
* Setup via Docker

    ```console
    docker build -t <NAME> .
    docker run -it --rm -p 8080:80 <NAME>
    ```
* Website available under `http://localhost:8080`

### Manual setup

1. Install apache2, php module for apache2 and the php-sqlite3 extension. E.g.:

    ```console
    apt install apache2 libapache2-mod-php php-sqlite3
    ```

2. Copy the `roary` folder to `var/www/` and `001-roary` to `/etc/apache2/site-available/`, e.g.

    ```console
    cp -T ./001-roary.conf /etc/apache2/sites-available/001-roary.conf
    cp -R -d ./roary /var/www/roary/
    ```
    
3. Set the user and group of the data folder in the roary folder to *www-data*

    ```console
    chown -R www-data:www-data /var/www/roary/data
    ```
    
4. Disable default vhost and enable 001-roary host, e.g. using

    ```console
    a2dissite 000-default
    a2ensite 001-roary
    ```

5. Reload the apache2 service, e.g.

    ```console
    apachectl restart
    ```
