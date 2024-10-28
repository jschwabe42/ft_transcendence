FROM python:3.13.0-alpine3.20

WORKDIR /code
RUN apk add postgresql-client
COPY --chown=root:root transcendence manage.py requirements.txt /code/
RUN pip install -r requirements.txt