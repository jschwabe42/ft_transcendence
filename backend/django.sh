#!/bin/sh

export DJANGO_SETTINGS_MODULE=transcendence.settings
# multiple languages support: compile *.po to *.mo
# django-admin compilemessages
python manage.py compilemessages

python manage.py makemigrations
python manage.py migrate

daphne -e ssl:8000:privateKey=dev.key:certKey=dev.crt transcendence.asgi:application
