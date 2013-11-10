var http = require('http');
var fs = require('fs');

var async = require('async');

var GifDuplex = require('../lib/gif-duplex');

module.exports = function gifServer (port) {

  var app = http.createServer(function (req, res) {
    res.writeHead(200, {
      'connection': 'keep-alive',
      'content-type': 'image/gif',
      'transfer-encoding': 'chunked'
    });
    var gifDuplex = new GifDuplex();

    async.eachSeries([
      'Hello',
      'Hello World',
      'Hello World!',
      'Hello World!!!'
    ], function addTextFrame (text, cb) {
      gifDuplex.writeTextFrame(text, cb);
    }, function handleTextError (err) {
      if (err) {
        throw err;
      }

      // Complete the gif
      gifDuplex.finish();
    });

    gifDuplex.on('data', function (buff) {
      res.write(buff);
    });

    gifDuplex.on('end', function () {
      res.end();
    });
  });

  app.listen(port);
  console.log('gifsockets server is listening at http://127.0.0.1:' + port + '/');
};

if (module.parent === null) {
  module.exports(7000);
}