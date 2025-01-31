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
### requires ruff and pre-commit to be installed (pip) - can also be used for format on save if needed, cli `ruff format ./path`, `ruff check ./path` 

`pre-commit run --all-files`
