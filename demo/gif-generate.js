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
var fs = require('fs');
fs.writeFileSync(__dirname + '/test.png', canvas.toDataURL().replace('data:image/png;base64,', ''), 'base64');

// TODO: Load in image-data.json
// TODO: Compare to canvas data
// TODO: Output canvas data to gif