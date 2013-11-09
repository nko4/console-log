var http = require('http');
var fs = require('fs');
var gifGenerate = require('./gif-generate');

var app = http.createServer(function (req, res) {
  res.writeHead(200, {
    'connection': 'keep-alive',
    'content-type': 'image/gif',
    'transfer-encoding': 'chunked'
  });
  gifGenerate(res);
});

var port = 7000;
app.listen(port);
console.log('gifsockets server is listening at http://127.0.0.1:7000/');
