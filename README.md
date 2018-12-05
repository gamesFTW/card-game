# Software requirements
nodeJs 8, docker

# How to run dev enviroment

## For Client
```
cd client
npm i && npm run dev 
```

## For Server
```
docker-compose up -d
export MONGO_IP=127.0.0.1  # set your docker agent ip address (not necessary for Win user)
export DOCKER_HOST_IP=127.0.0.1
cd game-server && npm i && npm run dev
```

In another terminal:
```
export MONGO_IP=127.0.0.1  # set your docker agent ip address (not necessary for Win user)
export DOCKER_HOST_IP=127.0.0.1
cd lobby-server
npm i
npm run dev 
```
