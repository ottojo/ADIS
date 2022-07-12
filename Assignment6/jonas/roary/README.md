## How to run
```console
cd roar
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
```

## Docker
```console
docker compose build
docker compose up
```

## Access Roary

http://127.0.0.1:8000/