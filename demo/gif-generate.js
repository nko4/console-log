var async = require('async');
var GifEncoder = require('gif.js/src/GIFEncoder');
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
  function drawImage(cb) {
    // Load the images in parallel
    var imageObjs = [{
      path: 'IMAGE_PATH',
      x: 0,
      y: 0
    }];
    async.each(imageObjs, function (imageObj, cb) {
      // Create an image and specify the source
      var img = new Image();
      img.src = imageObj.path;

      // Save the image for later
      imageObj._img = img;

      // Once the image loads, callback with it
      img.onload = function () {
        cb(null, img);
      };

      // If there is an error, callback with it
      img.onerror = function (err) {
        cb(err);
      };
    }, function imagesLoaded (err) {
      // If there was an error, throw it
      if (err) {
        console.error('Error loading image ', err);
        return cb(err);
      }

      // Draw the images on the canvas
      imageObjs.forEach(function drawImage (img) {
        context.drawImage(img._img, img.x, img.y);
      });

      // Continue
      cb(null);
    });
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
    console.log(dataJson);
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
  finishRendering = function () {
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
  var gifData = finishRendering();
  global.btoa = require('btoa');
  // from gh-pages/scripts/main.js
  buildDataURL = (function() {
    var charMap, i, _i;

    charMap = {};
    for (i = _i = 0; _i < 256; i = ++_i) {
      charMap[i] = String.fromCharCode(i);
    }
    return function(data) {
      var str, _j, _ref3;

      str = '';
      for (i = _j = 0, _ref3 = data.length; 0 <= _ref3 ? _j < _ref3 : _j > _ref3; i = 0 <= _ref3 ? ++_j : --_j) {
        str += charMap[data[i]];
      }
      return 'data:image/gif;base64,' + btoa(str);
    };
  })();

  console.log(buildDataURL(gifData));
});
