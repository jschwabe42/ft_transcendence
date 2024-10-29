#!/bin/sh

env_vars=(
    "PGADMIN_DEFAULT_EMAIL"
)

if [ ! -f secrets/.env ]; then
    touch secrets/.env
fi

declare -a existing_vars
if [ -f secrets/.env ]; then
    while IFS='=' read -r key value; do
        if [ -n "$key" ]; then
            existing_vars[$key]=$value
        fi
    done < secrets/.env
fi

# Iterate over the array and prompt the user for missing variables
for key in "${env_vars[@]}"; do
    if [ -z "${existing_vars[$key]}" ]; then
        read -p "Enter value for $key: " value
        if [ -z "$value" ]; then
            echo "$key=" >> secrets/.env
        else
            echo "$key=$value" >> secrets/.env
        fi
    fi
done