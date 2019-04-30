#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

export MONGO_IP=127.0.0.1  # set your docker agent ip address (not necessary for Win user)
export DOCKER_HOST_IP=127.0.0.1

cd ${DIR}/../game-server
npm i
npm run dev
