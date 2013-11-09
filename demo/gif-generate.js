var GifEncoder = require('gif.js/src/GIFEncoder');
var fs = require('fs');

// var WIDTH = 200;
// var HEIGHT = 200;

var WIDTH = 600;
var HEIGHT = 392;

var Canvas = require('canvas');
var canvas = new Canvas(WIDTH, HEIGHT);

var ctx = canvas.getContext('2d');

var img = new Canvas.Image();
img.src = fs.readFileSync(__dirname + '/test1-orig.jpg');

ctx.drawImage(img, 0, 0);

// ctx.font = '30px Impact';
// ctx.fillText("Awesome!", 50, 100);

// var te = ctx.measureText('Awesome!');
// ctx.strokeStyle = 'rgba(0,0,0,0.5)';
// ctx.beginPath();
// ctx.lineTo(50, 102);
// ctx.lineTo(50 + te.width, 102);
// ctx.stroke();

// console.log('<img src="' + canvas.toDataURL() + '" />');
console.log(canvas.toDataURL());
// var fs = require('fs');
// fs.writeFileSync(__dirname + '/test.png', canvas.toDataURL().replace('data:image/png;base64,', ''), 'base64');

return;

// Load in image-data.json
// var imageData = require('./image-data');
// var imageData = require('./image-data2');
// var data = new Uint8ClampedArray(imageData.length);
// data.set(imageData);
// var imgKeys = Object.getOwnPropertyNames(imageData).map(function (int) {
//   return parseInt(int, 10);
// });
// var maxKey = imgKeys.reduce(function (a, b) {
//   return Math.max(a, b);
// }, 0);
// var data = new Uint8ClampedArray(maxKey + 1);
// for (var i = 0; i < maxKey; i++) {
//   data[i] = imageData[i];
// }
// console.log(data);

global.atob = require('atob');
// Compare to canvas data
// https://gist.github.com/borismus/1032746
var BASE64_MARKER = ';base64,';

function convertDataURIToBinary(dataURI) {
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  // var raw = window.atob(base64);
  var raw = atob(base64);
  var rawLength = raw.length;
  var array = new Uint8ClampedArray(new ArrayBuffer(rawLength));

  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

// http://stackoverflow.com/questions/16194908/how-can-i-create-a-canvas-imagedata-array-from-an-arraybuffer-representation-of
// function convertDataURIToBinary(dataURI) {
//   // uri to Base64
//   b64 = dataURI.slice(dataURI.indexOf(',')+1);
//   // to String
//   str = atob(b64);
//   // to Array
//   arr = str.split('').map(function (e) {return e.charCodeAt(0);});
//   // to Uint8ClampedArray
//   u = new Uint8ClampedArray(arr); // [255, 56, 201, 8]

//   return u;
// }


// console.log(convertDataURIToBinary(canvas.toDataURL()));
var data = convertDataURIToBinary(canvas.toDataURL());

console.log(data);

// TODO: Output canvas data to gif
// Output pre-built image data to gif
var gif = new GifEncoder(WIDTH, HEIGHT);

gif.writeHeader();

gif.addFrame(data);

gif.finish();

// console.log(gif.out);

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

// console.log(buildDataURL(gifData));
