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

  gif.writeHeader();

  gif.setDelay(100);
  gif.setRepeat(0);
  gif.setQuality(10);

  parsedDataArr.forEach(function (data) {
    gif.addFrame(data);
  });

  gif.finish();

  // taken and modified from master/gif.coffee
  finishRendering = function (gif) {
    var len = 0;
    var imageParts = [gif];
    var frame;
    for (var i = 0; i < imageParts.length; i++) {
      frame = imageParts[i].out;
      len += (frame.pages.length - 1) * frame.constructor.pageSize + frame.cursor;
    }

    len += frame.constructor.pageSize - frame.cursor;

    // console.log(len);

    // console.log "rendering finished - filesize #{ Math.round(len / 1000) }kb"
    var data = new Uint8Array(len);
    var offset = 0;
    for (i = 0; i < imageParts.length; i++) {
      frame = imageParts[i].out;
      for (var j = 0; j < frame.pages.length; j++) {
        var page = frame.pages[j];
        // console.log(page, offset);
        // console.log(j, offset);
        data.set(page, offset);
        if (j === frame.pages.length - 1) {
          offset += frame.cursor;
        } else {
          offset += frame.constructor.pageSize;
        }
      }
    }

    return data;
  };

  // // console.log(finishRendering());
  var gifData = finishRendering(gif);
  console.log(gifData);


  // global.btoa = require('btoa');
  // // from gh-pages/scripts/main.js
  // buildDataURL = (function() {
  //   var charMap, i, _i;

  //   charMap = {};
  //   for (i = _i = 0; _i < 256; i = ++_i) {
  //     charMap[i] = String.fromCharCode(i);
  //   }
  //   return function(data) {
  //     var str, _j, _ref3;

  //     str = '';
  //     for (i = _j = 0, _ref3 = data.length; 0 <= _ref3 ? _j < _ref3 : _j > _ref3; i = 0 <= _ref3 ? ++_j : --_j) {
  //       str += charMap[data[i]];
  //     }
  //     return 'data:image/gif;base64,' + btoa(str);
  //   };
  // })();

  // console.log(buildDataURL(gifData));
});
