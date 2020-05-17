require('dotenv-safe').config();
let mapping = require('./mapping');

let express = require('express');
let app = express();
let cp = require('child_process');
let http = require('http');
let bodyParser = require('body-parser');
let crypto = require('crypto');

app.use(require('helmet')());

app.use(bodyParser.json({verify: function(req, res, buf, encoding){
  console.log('Received GitHub webhook call');
  if(req.header('X-GitHub-Event') != 'push')
    throw 'Not a push event, ignoring';
  if(req.header('X-Hub-Signature') != crypto.createHmac('sha256', process.env.HMAC_SECRET).update(buf).digest('hex'))
    throw 'Hmac validation failed, ignoring';
}}));

Object.entries(mapping).forEach(function([endpoint, script]){
  app.post(endpoint, function(req, res){
    if(req.body.ref != 'refs/heads/master')
      console.log('Not a push to master, ignoring');
    else {
      console.log('Executing [[' + script + ']]');
      console.log(cp.execSync(script).toString());
    }

    res.status(200).end(http.STATUS_CODES[200]);
  });
});

app.use(function(err, req, res, next){
  console.error(err);
  res.status(200).end(http.STATUS_CODES[200]);
});

var listener = app.listen(7443, 'localhost', function(){
  console.log('listening on %s:%s', listener.address().address, listener.address().port);
});
