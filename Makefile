# only requires secrets/.env, secrets/postgres_password to exist
# dev:
# 	docker compose build pongus_magnificus
# 	docker compose up --remove-orphans -d pongus_magnificus

# requires envars, pgadmin_password (see main.yml)
run:
	docker compose build
	docker compose up --remove-orphans -d

down:
	docker compose down
clean:
	docker compose down -v
nuke: clean
	yes | docker system prune -a
	$(MAKE) run

genenv:
	cd secrets && touch pgadmin_password postgres_password oauth_api_secret
	./genenv.sh

secret:
	@python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key(), end="")' > ./secrets/django_secret_key

re: clean run