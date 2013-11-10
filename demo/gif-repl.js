var fs = require('fs');
var http = require('http');
var readline = require('readline');

var async = require('async');

var GifDuplex = require('../lib/gif-duplex');

module.exports = function gifRepl (port) {

  // Keep track of array of connections
  var connections = [];


  var app = http.createServer(function (req, res) {
    res.writeHead(200, {
      'connection': 'keep-alive',
      'content-type': 'image/gif',
      'transfer-encoding': 'chunked'
    });
    var gifDuplex = new GifDuplex();

    gifDuplex.on('data', function (buff) {
      res.write(buff);
    });

    gifDuplex.on('end', function () {
      res.end();
    });

    connections.push(gifDuplex);
  });

  app.listen(port);
  console.log('gifsockets server is listening at http://127.0.0.1:' + port + '/');

  // When we get a readline, genreate a text frame for each connection
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function prompt() {
    rl.question('Enter text> ', function (text) {
      console.log('Outputting: ' + text);
      connections.forEach(function writeToResponse (gifDuplex) {
        gifDuplex.writeTextFrame(text);
      });
      prompt();
    });
  }
  prompt();

  // TODO: Probably should do an on exit -> close listener
};

if (module.parent === null) {
  module.exports(7000);
}
