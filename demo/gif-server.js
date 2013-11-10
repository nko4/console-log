var fs = require('fs');
var http = require('http');

var getRawBody = require('raw-body');

var GifDuplex = require('../lib/gif-duplex');

module.exports = function gifRepl (port) {

  // Keep track of array of connections
  var connections = [];

  var app = http.createServer(function (req, res) {
    console.log('Request received');

    if (req.method === 'POST') {
      writeTextToConnections(req, res);
    } else {
      openNewGif(req, res);
    }
  });

  function openNewGif(req, res) {
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
  }

  // TODO: Debug single quotes in URLs

  function writeTextToConnections(req, res) {
    // Parse in the body (up to 1mb)
    console.log('Parsing body');
    getRawBody(req, {
      expected: req.headers['content-length'],
      limit: 1 * 1024 * 1024 // 1 mb
    }, function (err, buffer) {
      console.log('Body parsed');
      // If there was an error (e.g. bad length, over length), respond poorly
      if (err) {
        res.writeHead(500, {
          'content-type': 'text/plain'
        });
        res.end('Content was not as expected');
      }

      // Write out our text to all connections
      var text = buffer.toString();
      console.log('Outputting: ' + text);
      if (connections.length) {
        connections[0].getTextFrameData(text, function (err, dataArr) {
          connections.forEach(function writeToResponse (gifDuplex) {
            gifDuplex.writeFrameData(dataArr);
          });

          res.writeHead(204);
          res.end();
        });
      }
    });
  }

  app.listen(port);
  console.log('gifsockets server is listening at http://127.0.0.1:' + port + '/');
};

if (module.parent === null) {
  module.exports(7000);
}
