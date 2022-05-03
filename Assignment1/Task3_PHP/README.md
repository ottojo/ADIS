# Assignment 1, Task 3

### Setup
* A Makefile is provided to build and launch a docker container:
    ```console
    make run
    ```
    Alternatively, manually:
    ```console
    docker build -t adis_1_3 docker
	docker run -p 8080:80 --rm -it -v $PWD/src:/var/www/html adis_1_3
    ```
* Website available under `http://localhost:8080`
