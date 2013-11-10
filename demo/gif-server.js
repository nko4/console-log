var fs = require('fs');
var http = require('http');

var getRawBody = require('raw-body');

var GifPerformance = require('../lib/gif.js/GifPerformance');

module.exports = function gifRepl (port) {

  // Keep track of array of connections
  var firstConections = [];
  var secondConnections = [];

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

    firstConections.push({
      res: res
    });
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


      // Generate a new GIF to encode
      var gif = new GifPerformance();


      gif.callMethod('getTextFrameData', function (err, dataArr) {
        console.log('hi');

        function writeToFirstConnections(buff) {
          firstConnections.forEach(function writeToFirstConnection (conn) {
            conn.res.write(buff);
          });
        }
        function writeToSecondConnections(buff) {
          secondConnections.forEach(function writeToSecondConnection (conn) {
            conn.res.write(buff);
          });
        }
        // If we have firstConnections, write a header for them
        if (firstConnections.length) {
          gif.on('data', writeToFirstConnections);
          gif.writeHeader();
          // gif.
        }
      });
      // Send a no content response
      res.writeHead(204);
      res.end();
    });
  }

  app.listen(port);
  console.log('gifsockets server is listening at http://127.0.0.1:' + port + '/');
};

if (module.parent === null) {
  module.exports(7000);
}
