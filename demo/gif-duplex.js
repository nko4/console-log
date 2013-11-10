var fs = require('fs');

var async = require('async');

var GifDuplex = require('../lib/gif-duplex');

if (module.parent === null) {
  var stream = fs.createWriteStream(__dirname + '/test-duplex.gif');
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
    stream.write(buff);
  });
}