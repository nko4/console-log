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

// Compare to canvas data
// https://gist.github.com/borismus/1032746
var BASE64_MARKER = ';base64,';

var atob2 = require('atob');
function convertDataURIToBinary(dataURI) {
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  // var raw = window.atob(base64);
  var raw = atob2(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}
console.log(convertDataURIToBinary(canvas.toDataURL()));

// TODO: Output canvas data to gif