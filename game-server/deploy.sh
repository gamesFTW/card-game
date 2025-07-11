# tar --exclude='./node_modules' -czf app.tar.gz .
tar --exclude='./node_modules' --exclude='./src/static/client'  -czf app.tar.gz .

scp app.tar.gz dh@103.110.65.87:/home/dh/
rm app.tar.gz

ssh dh@103.110.65.87 << EOF
  cd /home/dh/
  rm -rf ./app
  mkdir app
  tar -xzf app.tar.gz -C ./app
  rm app.tar.gz
  cd /home/dh/app
  docker compose -f docker-compose.prod.yml down
  docker compose -f docker-compose.prod.yml up --build -d
EOF
