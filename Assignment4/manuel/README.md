# Assignment 4

### Docker setup
* Setup via Docker

    ```console
    docker build -t <NAME> .
    docker run -it --rm -p 8080:3000 <NAME>
    ```
* Website available under `http://localhost:8080`

### Manual setup

1. Install node.js (including npm). E.g. via:

    ```console
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install nodejs
    ```

2. Inside the *node* folder, install all dependencies using:

    ```console
    cd node
    npm install
    ```

3. That's it. Use `npm start` to start the server. By default it runs on port 3000.
