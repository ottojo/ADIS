# Assignment 1, Task 1:
* Server installation is documented in the Dockerfile
  * run via `docker build -t apache . && docker run -it --rm -p 8080:80 apache`
* The apache configuration is provided in cgi_php.conf
* Examples are hosted at:
  * http://localhost:8080/cgi-bin/hello_cgi.pl
  * http://localhost:8080/hello_php.php
  * http://localhost:8080/hello.html
