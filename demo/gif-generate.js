var async = require('async');
var GifEncoder = require('gif.js/src/GIFEncoder');
var imageInfo = require('./phantomjs-image-info');

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
  imageInfo(__dirname + '/' + filename, WIDTH, HEIGHT, cb);
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
