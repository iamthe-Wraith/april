#!/bin/bash

cd $1
docker login -u $2 -p $3
docker compose down --rmi all --volumes --remove-orphans
docker compose up -d
