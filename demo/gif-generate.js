var fs = require('fs');
var async = require('async');
var GifEncoder = require('../lib/gif.js/GIFEncoder');
var imageInfo = require('../lib/image-info');

module.exports = function writeGifToStream(stream) {
  var WIDTH = 600;
  var HEIGHT = 392;

  async.map([
    'images/anim1.jpg',
    'images/anim2.jpg',
    'images/anim3.jpg',
    'images/anim4.jpg'
  ], function getFrameInfo (filename, cb) {
    // TODO: Accept canvas as a parameter
    function drawImage(cb) {
      // Create a new image
      var img = new Image();
      img.src = 'IMAGE_PATH';

      // Once the image loads, callback with it
      img.onload = function () {
        context.drawImage(img, 0, 0);
        context.font = '30px Impact';
        context.fillText('SNOOOOW', 50, 100);
        cb(null);
      };

      // If there is an error, callback with it
      img.onerror = function (err) {
        cb(err);
      };
    }

    var fn = (drawImage + '')
              .replace('IMAGE_PATH', __dirname + '/' + filename)
              .replace('function drawImage(cb) {', '')
              .replace(/}$/, '');

    imageInfo({
      width: WIDTH,
      height: HEIGHT,
      js: fn
    }, cb);
  }, function processFrameInfo (err, unparsedDatas) {
    if (err) {
      throw err;
    }

    var parsedDataArr = unparsedDatas.map(function (dataJson) {
      var dataArr = JSON.parse(dataJson);
      var data = new Uint8ClampedArray(dataArr.length);
      data.set(dataArr);
      return data;
    });

    // Output canvas data to gif
    var gif = new GifEncoder(WIDTH, HEIGHT);

    // TODO: Optimize streaming events into transactional buffers (e.g. frame)
    var i = 0;
    function writeToStream(buffer) {
      setTimeout(function () {
        stream.write(buffer);
      }, i * 1000);
      i += 1;
    }
    gif.on('frame', writeToStream);
    gif.on('end', function () {
      setTimeout(function () {
        stream.end();
      }, i * 1000);
    });

    gif.on('byte', writeToStream);
    gif.writeHeader();

    gif.setDelay(100);
    gif.setRepeat(0);
    gif.setQuality(10);
    gif.removeListener('byte', writeToStream);

    parsedDataArr.forEach(function (data) {
      gif.addFrame(data);
    });

    gif.on('byte', writeToStream);
    gif.finish();
    gif.removeListener('byte', writeToStream);
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