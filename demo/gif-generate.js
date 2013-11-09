// Image from http://i1.ytimg.com/vi/QH2-TGUlwu4/hqdefault.jpg
var GifEncoder = require('gif.js/src/GIFEncoder');

var Canvas = require('canvas');
var canvas = new Canvas(200, 200);

var ctx = canvas.getContext('2d');

ctx.font = '30px Impact';
ctx.fillText("Awesome!", 50, 100);

var te = ctx.measureText('Awesome!');
ctx.strokeStyle = 'rgba(0,0,0,0.5)';
ctx.beginPath();
ctx.lineTo(50, 102);
ctx.lineTo(50 + te.width, 102);
ctx.stroke();

// console.log('<img src="' + canvas.toDataURL() + '" />');
// var fs = require('fs');
// fs.writeFileSync(__dirname + '/test.png', canvas.toDataURL().replace('data:image/png;base64,', ''), 'base64');

// Load in image-data.json
var imageData = require('./image-data');
var imgKeys = Object.getOwnPropertyNames(imageData).map(function (int) {
  return parseInt(int, 10);
});
var maxKey = imgKeys.reduce(function (a, b) {
  return Math.max(a, b);
}, 0);
var data = new Uint8ClampedArray(maxKey);
for (var i = 0; i < maxKey; i++) {
  data[i] = imageData[i];
}

global.atob = require('atob');
// Compare to canvas data
// https://gist.github.com/borismus/1032746
// var BASE64_MARKER = ';base64,';

// function convertDataURIToBinary(dataURI) {
//   var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
//   var base64 = dataURI.substring(base64Index);
//   // var raw = window.atob(base64);
//   var raw = atob(base64);
//   var rawLength = raw.length;
//   var array = new Uint8ClampedArray(new ArrayBuffer(rawLength));

//   for(i = 0; i < rawLength; i++) {
//     array[i] = raw.charCodeAt(i);
//   }
//   return array;
// }

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
// convertDataURIToBinary(canvas.toDataURL());

// TODO: Output canvas data to gif
// Output pre-built image data to gif
var gif = new GifEncoder(200, 200);

gif.addFrame(data);

// console.log(gif.out);

finishRendering = function () {
  var len = 0;
  var imageParts = [gif];
  var frame;
  for (var i = 0; i < imageParts.length; i++) {
    frame = imageParts[i].out;
    len += (frame.pages.length - 1) * frame.constructor.pageSize + frame.cursor;
  }

  len += frame.constructor.pageSize - frame.cursor;

  // console.log "rendering finished - filesize #{ Math.round(len / 1000) }kb"
  var data = new Uint8Array(len);
  var offset = 0;
  for (frame in imageParts) {
    for (var page in frame.pages) {
      data.set(page, offset);
      if (i === frame.pages.length - 1) {
        offset += frame.cursor;
      } else {
        offset += frame.constructor.pageSize;
      }
    }
  }

  return data;
};

// // console.log(finishRendering());
console.log(finishRendering());

// console.log(gif.out);