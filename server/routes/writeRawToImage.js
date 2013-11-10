var qs = require('querystring');

var getRawBody = require('raw-body');

var GifPerformance = require('../../lib/gif-performance');

module.exports = function writeTextToConnections (req, res) {
  var firstConnections = req.firstConnections;
  var secondConnections = req.secondConnections;

  // Parse in the body (up to 1mb)
  console.log('RAW-BODY-PARSE: Parsing body');
  getRawBody(req, {
    expected: req.headers['content-length'],
    limit: 1 * 1024 * 1024 // 1 mb
  }, function (err, buffer) {
    console.log('RAW-BODY-PARSE: Body parsed');
    // If there was an error (e.g. bad length, over length), respond poorly
    if (err) {
      res.writeHead(500, {
        'content-type': 'text/plain'
      });
      return res.end('Content was too long');
    }

    // Break up form submission
    var dataStr = buffer.toString();
    var imageData = JSON.parse(dataStr);

    if (text === undefined) {
      res.writeHead(500, {
        'content-type': 'text/plain'
      });
      return res.end('Missing "text" parameter');
    }

    // Write out our text to all connections
    console.log('RAW-Outputting: ');

    // Generate a new GIF to encode
    var gif = new GifPerformance();

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
      console.log('RAW-ANALYZE: Analyzing image');
      gif.analyzeImage(imageData);
      console.log('RAW-ANALYZE: Image analyzed');

      // Write out the image info for the first connections (addFrame#2)
      console.log('RAW-FIRST-INFO: Writing image info to first connections');
      gif.writeImageInfo();
      gif.flushData();
      console.log('RAW-FIRST-INFO: First conections completed');

      // Write out the image info for the second connections (addFrame#2)
      console.log('RAW-SECOND-INFO: Writing image info to second connections');
      gif.removeListener('data', writeToFirstConnections);
      gif.on('data', writeToSecondConnections);
      gif.writeImageInfo();
      gif.flushData();
      console.log('RAW-SECOND-INFO: Second conections completed');

      // Write out the image itself for all connections (addFrame#3)
      console.log('RAW-IMAGE-ALL: Writing image to all connections');
      gif.on('data', writeToFirstConnections);
      gif.outputImage();
      gif.flushData();
      console.log('RAW-IMAGE-ALL: All connections completed');

      // Clean up event listeners
      gif.removeAllListeners();

      // TODO: On process close, write out finish to all connections

      // Move all firstConnections to secondConnections
      secondConnections.push.apply(secondConnections, firstConnections);
      firstConnections.splice(0, firstConnections.length);
    });

    // Send a no content response
    res.writeHead(204);
    res.end();
};
