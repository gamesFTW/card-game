# How to run dev env

## For Client
```
cd client
npm i && npm run dev 
```

## For Server
```
docker-compose up
```

In another terminal:
```
export MONGO_IP=127.0.0.1  # set your docker agent ip address (not necessary for Win user)
npm i
npm run dev 
```
