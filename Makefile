# run without docker: requires secrets/.env with REMOTE_OAUTH_UID set, secrets/oauth_api_secret set
ifneq (,$(findstring Darwin,$(UNAME_S)))
	ifneq (,$(wildcard secrets/.env))
		include secrets/.env
		export $(shell sed 's/=.*//' secrets/.env)
	endif
endif

runlocal:
	$(info "Running locally")

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
	cd secrets && touch pgadmin_password postgres_password oauth_api_secret
	./genenv.sh

re: clean run