# ft_transcendence


<!-- Nuke Database -->


rm -rf backend/db.sqlite3
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete