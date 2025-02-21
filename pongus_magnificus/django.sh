#!/bin/sh

export DJANGO_SETTINGS_MODULE=transcendence.settings
# multiple languages support: compile *.po to *.mo
python manage.py compilemessages

python manage.py makemigrations
python manage.py migrate

python manage.py collectstatic --noinput

daphne -e ssl:8000:privateKey=/run/secrets/ssl_key:certKey=/run/secrets/ssl_cert transcendence.asgi:application
