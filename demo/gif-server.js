var http = require('http');
var fs = require('fs');
var gifGenerate = require('./gif-generate');

module.exports = function gifServer (port) {

  var app = http.createServer(function (req, res) {
    res.writeHead(200, {
      'connection': 'keep-alive',
      'content-type': 'image/gif',
      'transfer-encoding': 'chunked'
    });
    gifGenerate(res);
  });

  app.listen(port);
  console.log('gifsockets server is listening at http://127.0.0.1:7000/');
};

if (module.parent === null) {
  module.exports(7000);
}