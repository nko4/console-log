var fs = require('fs');
var async = require('async');
var GifEncoder = require('../lib/gif.js/GIFEncoder');
var imageInfo = require('../lib/image-info');

module.exports = function writeGifToStream(stream) {
  var WIDTH = 600;
  var HEIGHT = 392;

  // Output canvas data to gif
  var gif = new GifEncoder(WIDTH, HEIGHT);

  var i = 0;
  function delay(fn) {
    // setTimeout(fn, i * 100);
    fn();
    i += 1;
  }
  function writeToStream(buffer) {
    delay(function () {
      stream.write(buffer);
    });
  }

  var activeData = [];
  gif.on('data', function (val) {
    activeData.push(val);
  });
  function outputActiveData() {
    var buffer = new Buffer(activeData);
    activeData = [];
    console.log('wrote');
    writeToStream(buffer);
  }
  gif.on('writeHeader#stop', outputActiveData);
  gif.on('frame#stop', outputActiveData);
  gif.on('finish#stop', function () {
    outputActiveData();

    gif.on('end', function () {
      delay(function () {
        stream.end();
      });
    });
  });

  // Open the gif
  gif.writeHeader();

  // Configure the gif
  // gif.setDelay(100);
  // gif.setRepeat(0);
  gif.setQuality(10);

  async.eachSeries([
    'Hello',
    'Hello World',
    'Hello World!',
    'Hello World!!!'
  ], function getFrameInfo (text, cb) {
    // TODO: Accept canvas as a parameter
    function drawImage(cb) {
      context.font = '30px Impact';
      context.fillStyle = '#FFFFFF';
      context.fillText('TEXT', 50, 100);
      cb(null);
    }

    var fn = (drawImage + '')
              .replace('TEXT', text)
              .replace('function drawImage(cb) {', '')
              .replace(/}$/, '');

    // TODO: Performance improvment: phantomjs HTTP server
    // Dodges starting a new process each time
    // Prevents EMFILE (file descriptor limit)

    // var start = Date.now();

    imageInfo({
      width: WIDTH,
      height: HEIGHT,
      js: fn
    }, function parseFrameInfo (err, unparsedJson) {
      if (err) {
        return cb(err);
      }

      // TODO: Can imageInfo stream out data?
      var dataArr = JSON.parse(unparsedJson);
      gif.addFrame(dataArr);

      // console.log(Date.now() - start);

      cb(null);
    });
  }, function finishGif (err) {
    if (err) {
      throw err;
    }

    // Complete the gif
    gif.finish();
  });
};

if (module.parent === null) {
  var stream = fs.createWriteStream(__dirname + '/test.gif');

  stream.on('finish', function () {
    console.log('finished');
    process.exit();
  });

  module.exports(stream);
}