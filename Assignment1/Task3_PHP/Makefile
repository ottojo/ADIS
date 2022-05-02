ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
run:
	docker build -t adis_1_3 $(ROOT_DIR)/docker
	docker run -p 8080:80 --rm -it -v $(ROOT_DIR)/src:/var/www/html adis_1_3
