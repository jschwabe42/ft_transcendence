# general
- do not save any personal data to django-admin, it can be read from [data](db.sqlite3)
### nuke database
1. rm -rf backend/db.sqlite3
2. find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
2. find . -path "*/migrations/*.pyc" -delete
### `python manage.py migrate` does not work	
- `python manage.py makemigrations`
	- figure it out: `python manage.py` ...

# how to ... ?
## create a superuser?
`python manage.py createsuperuser`
## change a password
`python manage.py changepassword` 
## run pre-commit before committing
requires ruff and pre-commit, ruff extension for format on save
### setup for repo:
1. `pip install pre-commit ruff`
2. `pre-commit install --install-hooks` (prevents commits that would fail in CI)
- run `ruff format ./path` and `ruff check ./path` OR `pre-commit run --all-files`

### Do the translations:
- `django-admin makemessages --all` <br> Creates or updates the .po files for all languages. msgid is the english text and the msgstr contains the translation for that language
- `django-admin compilemessages` <br> Compiles all the .po files into .mo files which then can be interpreted by the browser
- `django-admin makemessages -d djangojs --all` To create the javascript .po files.
- `find . -path "*/LC_MESSAGES/*.mo" -delete` remove compiled .mo files


#### CLI curl commands

game Creation
curl -X POST https://localhost:8000/pong/api/create-game/ \
   --cacert backend/certs/dev.crt \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer hash" \
   -d '{"username": "Jsanger", "opponent": "NewUser"}'


update score
curl -X POST https://localhost:8000/pong/api/get-score/ \
   --cacert backend/certs/dev.crt \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer hash" \
   -d '{"score1": "1", "score2": "5", "game_id": "1"}'

update key controlls
curl -X POST https://localhost:8000/pong/api/get-gameControl/ \
   --cacert backend/certs/dev.crt \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer hash" \
   -d '{"control1": "w_s", "control2": "w_s", "game_id": "1", "username": "Jsanger"}'