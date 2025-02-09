#!/bin/sh

# multiple languages support: compile *.po to *.mo
django-admin compilemessages

python manage.py makemigrations
python manage.py migrate

python manage.py runserver 0.0.0.0:8000