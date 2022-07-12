#!/usr/bin/env bash
set -e
set -x
cd /roar
python3 -m venv .venv-docker
source .venv-docker/bin/activate
pip install -r requirements.txt

python manage.py makemigrations roars
python manage.py migrate
python manage.py runserver 0:8000
