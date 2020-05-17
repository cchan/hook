#!/bin/sh

set -e

npm install --production

sudo cp hook.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo service hook start
sudo systemctl enable hook.service

for f in $(ls *.conf); do
  ln -s $(realpath $f) /etc/nginx/sites-available/$(basename $f)
  ln -s /etc/nginx/sites-available/$(basename $f) /etc/nginx/sites-enabled/$(basename $f)
done
sudo service nginx restart
