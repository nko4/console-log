var fs = require('fs');
var async = require('async');
var GifEncoder = require('../lib/gif.js/GIFEncoder');
var imageInfo = require('../lib/image-info');

var WIDTH = 600;
var HEIGHT = 392;

// TODO: Figure out how to do arbitrary text. Maybe phantomjs server

async.map([
  // 'test1-orig.jpg'
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

  var stream = fs.createWriteStream(__dirname + '/test.gif');

  stream.on('finish', function () {
    console.log('finished');
    process.exit();
  });

  // TODO: Optimize streaming events into transactional buffers (e.g. frame)
  gif.on('frame', function (buffer) {
    console.log(stream.write(buffer));
  });
  gif.on('end', function () {
    stream.end();
  });

  gif.writeHeader();

  gif.setDelay(100);
  gif.setRepeat(0);
  gif.setQuality(10);

  parsedDataArr.forEach(function (data) {
    gif.addFrame(data);
  });

  gif.finish();

  // // taken and modified from master/gif.coffee
  // finishRendering = function (gif) {
  //   var len = 0;
  //   var imageParts = [gif];
  //   var frame;
  //   for (var i = 0; i < imageParts.length; i++) {
  //     frame = imageParts[i];
  //     len += (frame.pages.length - 1) * GifEncoder.ByteArray.pageSize + frame.cursor;
  //   }

  //   len += GifEncoder.ByteArray.pageSize - frame.cursor;

  //   // console.log(len);

  //   // console.log "rendering finished - filesize #{ Math.round(len / 1000) }kb"
  //   var data = new Buffer(len);
  //   var offset = 0;
  //   for (i = 0; i < imageParts.length; i++) {
  //     frame = imageParts[i];
  //     for (var j = 0; j < frame.pages.length; j++) {
  //       var page = frame.pages[j];
  //       // console.log(page, offset);
  //       // console.log(j, offset);
  //       for (var k = 0; k < page.length; k++) {
  //         data.writeUInt8(page[k], offset + k);
  //       }
  //       if (j === frame.pages.length - 1) {
  //         offset += frame.cursor;
  //       } else {
  //         offset += GifEncoder.ByteArray.pageSize;
  //       }
  //     }
  //   }

  //   return data;
  // };

  // // // console.log(finishRendering());
  // var gifData = finishRendering(gif);
  // // console.log(gifData);


  // fs.writeFileSync(__dirname + '/test.gif', gifData);
});
