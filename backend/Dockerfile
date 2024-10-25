FROM python:3.13.0-alpine3.20

WORKDIR /code

COPY --chown=root:root transcendence manage.py requirements.txt /code/
RUN pip install -r requirements.txt