#!/bin/bash

cd $1
echo "$3" | docker login --username $2 --password-stdin
docker compose down --rmi all --volumes --remove-orphans
docker compose up -d
