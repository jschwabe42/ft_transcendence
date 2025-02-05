# general
- do not save any personal data to django-admin, it can be read from [data](db.sqlite3)
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
