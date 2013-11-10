var fs = require('fs');
var http = require('http');

var getRawBody = require('raw-body');

var GifPerformance = require('../lib/gif-performance');

module.exports = function gifRepl (port) {

  // Keep track of array of connections
  var firstConnections = [];
  var secondConnections = [];

  var app = http.createServer(function (req, res) {
    if (req.method === 'POST') {
      writeTextToConnections(req, res);
    } else {
      openNewGif(req, res);
    }
  });

  function openNewGif(req, res) {
    console.log('CONNECTION-ADDED');
    res.writeHead(200, {
      'connection': 'keep-alive',
      'content-type': 'image/gif',
      'transfer-encoding': 'chunked'
    });

    firstConnections.push({
      res: res
    });
  }

  // TODO: Debug single quotes in URLs

  function writeTextToConnections(req, res) {
    // Parse in the body (up to 1mb)
    console.log('BODY-PARSE: Parsing body');
    getRawBody(req, {
      expected: req.headers['content-length'],
      limit: 1 * 1024 * 1024 // 1 mb
    }, function (err, buffer) {
      console.log('BODY-PARSE: Body parsed');
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

      console.log('GET-FRAME: Fetching frame data');
      gif.getTextFrameData(text, function receiveTextFrameData (err, imageData) {
        console.log('GET-FRAME: Frame data fetched');
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
          gif.flushData();
        }

        // Process the image (addFrame#1)
        console.log('ANALYZE: Analyzing image');
        gif.analyzeImage(imageData);
        console.log('ANALYZE: Image analyzed');

        // Write out the image info for the first connections (addFrame#2)
        console.log('FIRST-INFO: Writing image info to first connections');
        gif.writeImageInfo();
        gif.flushData();
        console.log('FIRST-INFO: First conections completed');

        // Write out the image info for the second connections (addFrame#2)
        console.log('SECOND-INFO: Writing image info to second connections');
        gif.removeListener('data', writeToFirstConnections);
        gif.on('data', writeToSecondConnections);
        gif.writeImageInfo();
        gif.flushData();
        console.log('SECOND-INFO: Second conections completed');

        // Write out the image itself for all connections (addFrame#3)
        console.log('IMAGE-ALL: Writing image to all connections');
        gif.on('data', writeToFirstConnections);
        gif.outputImage();
        gif.flushData();
        console.log('IMAGE-ALL: All connections completed');

        // Clean up event listeners
        gif.removeAllListeners();

        // TODO: On process close, write out finish to all connections

        // Move all firstConnections to secondConnections
        secondConnections.push.apply(secondConnections, firstConnections);
        firstConnections = [];
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
