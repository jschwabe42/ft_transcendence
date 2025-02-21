#!/bin/bash

env_vars=(
    # "PGADMIN_DEFAULT_EMAIL"
    "REMOTE_OAUTH_UID"
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

certs_dir="pongus_magnificus/certs"
if [ ! -d "$certs_dir" ]; then
    mkdir -p "$certs_dir"
fi

key_file="$certs_dir/dev.key"
crt_file="$certs_dir/dev.crt"

if [ ! -f "$key_file" ] || [ ! -f "$crt_file" ]; then
    echo "Generating SSL certificates..."
    read -p "Enter your country (2 letter code) [US]: " country
    country=${country:-US}
    read -p "Enter your state or province [California]: " state
    state=${state:-California}
    read -p "Enter your city [San Francisco]: " city
    city=${city:-San Francisco}
    read -p "Enter your organization [My Company]: " organization
    organization=${organization:-My Company}
    read -p "Enter your organizational unit [IT]: " organizational_unit
    organizational_unit=${organizational_unit:-IT}
    read -p "Enter your common name (e.g., domain name) [localhost]: " common_name
    common_name=${common_name:-localhost}

    openssl genrsa -out "$key_file" 2048
    openssl req -new -key "$key_file" -out "$certs_dir/dev.csr" -subj "/C=$country/ST=$state/L=$city/O=$organization/OU=$organizational_unit/CN=$common_name"
    openssl x509 -req -days 365 -in "$certs_dir/dev.csr" -signkey "$key_file" -out "$crt_file"
    rm "$certs_dir/dev.csr"
    echo "SSL certificates generated and saved to $certs_dir"
else
    echo "SSL certificates already exist in $certs_dir"
fi