#!/bin/sh

set -e

pip install -r backend/requirements.txt
pip install -r deploy/requirements.txt
npm install --production --prefix frontend
npm run build --prefix frontend

sudo cp gosudoku.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo service gosudoku start
sudo systemctl enable gosudoku.service

for conf in $(ls *.conf); do
  ln -s $(realpath $f) /etc/nginx/sites-available/$(basename $f)
  ln -s /etc/nginx/sites-available/$(basename $f) /etc/nginx/sites-enabled/$(basename $f)
done
sudo service nginx restart
