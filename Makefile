# only requires secrets/.env, secrets/postgres_password to exist
dev:
	docker compose build backend
	docker compose up --remove-orphans -d backend

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
	cd secrets && touch pgadmin_password postgres_password
	./genenv.sh

re: clean run