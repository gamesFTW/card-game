#!/usr/bin/env bash
set +xe

ADDRESS="root@vscale.ep1c.org"
BUILD_FILENAME="phaser-meteor-demo.tar.gz"

cmd "/C meteor build build"

scp build/${BUILD_FILENAME} ${ADDRESS}:~/builds/
ssh ${ADDRESS} "cd builds && tar -xvf ${BUILD_FILENAME}"
ssh ${ADDRESS} "cd builds/bundle/programs/server && npm i"

# Без nvm не находится forever который установлен в nvm/bin
ssh ${ADDRESS} '. ~/.nvm/nvm.sh && forever restartall'
