# Assignment 6

## Setup

### Docker setup
* Setup via Docker

    ```console
    docker build -t <NAME> .
    docker run -it --rm -p 8080:80 <NAME>
    ```
* Website available under `http://localhost:8080`

### Manual setup

1. Install node.js (including npm) and nginx which will be used to server static files and act
as a reverse proxy in order to loadbalance requests to multiple Roary instances. Aditionally,
redis is required for sharing session management data. Install e.g. via:

    ```console
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install nodejs nginx redis
    ```

2. Inside the *node* folder, a single Roary instance can be run using `npm start`. However, we're going to run multiple instances of Roary in order to enable higher throughput (because Node.js is single-threaded). We use the *pm2* process manager for this. In order to install all dependencies and the *pm2* process manager, run e.g.:

    ```console
    cd node
    npm install
    npm install -g pm2
    ```

3. The index HTML file is to be served statically by nginx, so copy it into the appropriate folder:

    ```console
    sudo mkdir -p /var/www/roary-public
    sudo cp -R -d node/public /var/www/roary-public/
    ```

4. Change the nginx configuration to the *roary* configuration inside the *nginx* folder. Do this as follows:

    ```console
    sudo cp nginx/roary /etc/nginx/sites-available/roary
    sudo rm /etc/nginx/sites-enabled/*
    sudo ln -s /etc/nginx/sites-available/roary /etc/nginx/sites-enabled/roary
    sudo nginx -s reload
    ```
    
    Note, depending on the OS config, nginx might not have started (especially without
    systemd installation, e.g. in docker containers, no nginx process is started by default).
    In this case, replace the reload command with:
    
    ```console
    sudo nginx -c "/etc/nginx/nginx.conf"
    ```
    
    This starts the nginx process(es). Also note that the same thing applies to the redis
    server which might also not be start by default. In this case, run
    
    ```console
    redis-server
    ```
    
    This will not run as daemon in the background. If this is desired, just use:

    ```console
    redis-server --daemonize yes
    ```

5. When nginx and the redis server are running, a cluster of Roary instances (starting on port 3500) can be started via:

    ```console
    cd node
    pm2 start process.yml
    ```
    
    Alternatively, we can also use `pm2-runtime` instead of `pm2` which is a drop-in replacement
    for the `node` command, meaning that processes are run in the foreground instead of as daemon.
    Stopping the cluster can be done using `pm2 stop all` or simply with CTRL+C in the former case.
    As stated previously, a single instance can also be run just by using `npm start`.
    
    Nginx acts as reverse proxy to all those instances via port 80, so the website is 
    accessible on `localhost:80`.
    
## Changes to NodeJS Roary implementation from Assignment 4 to achieve "web-scale"

* TODO

## Performance Results

* TODO
