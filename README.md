# Software requirements
nodeJs 8, docker

# How to run dev enviroment

## For Client
Get unity compiled bin file and run it (or build it in unity editor from `unity-client/`)

## For Server
### Content server 
```
export METEOR_IMAGES_PATH=""
export METEOR_SOUNDS_PATH=""
cd meteor-card-game-server
meteor -p 4000
```

### Game server 
```
docker-compose up -d
export MONGO_IP=127.0.0.1  # set your docker agent ip address (not necessary for Win user)
export DOCKER_HOST_IP=127.0.0.1
cd game-server
npm i
npm run dev
```

### AI server
