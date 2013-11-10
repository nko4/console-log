var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var extend = require('obj-extend');

var GifEncoder = require('../lib/gif.js/GIFEncoder');
var imageInfo = require('../lib/image-info-server');
function noop() {}

function GifPerformance(options) {
  // Inherit from EventEmitter
  EventEmitter.call(this);

  // Set up options
  options = options || {};
  var width = options.width || 600;
  var height = options.height || 392;
  this.width = width;
  this.height = height;

  // Output canvas data to gif
  var gif = new GifEncoder(width, height);
  var that = this;

  this.activeData = [];
  gif.on('data', function (val) {
    that.activeData.push(val);
  });
  gif.on('end', function () {
    that.emit('end');
  });

  // Configure the gif
  // gif.setDelay(100);
  // gif.setRepeat(0);
  gif.setQuality(options.quality || 10);

  // Save gif for methods
  this.gif = gif;
}
GifPerformance.prototype = extend({
  flushData: function () {
    var buffer = new Buffer(this.activeData);
    this.activeData = [];
    this.emit('data', buffer);
  },
  writeHeader: function () {
    this.gif.writeHeader();
  },
  analyzeImage: function (imageData) {
    this.gif.analyzeImage(imageData);
  },
  _pixelHack: function (imageData) {
    this.gif._pixelHack(imageData);
  },
  analyzePixels: function (imageData) {
    this.gif.analyzePixels(imageData);
  },
  writeImageInfo: function () {
    this.gif.writeImageInfo();
  },
  outputImage: function () {
    this.gif.outputImage();
  },
  writeFrameData: function (dataArr) {
    this.gif.addFrame(dataArr);
  },
  getTextFrameData: function (text, cb) {
    function drawImage(cb) {
      context.font = '30px Impact';
      context.fillStyle = '#FFFFFF';
      context.fillText("TEXT", 50, 100);
      cb(null);
    }

    cb = cb || noop;
    var fn = (drawImage + '')
              // Ain't no injection like a JavaScript eval injection
              .replace('"TEXT"', JSON.stringify(text))
              .replace('function drawImage(cb) {', '')
              .replace(/\}$/, '');

    console.log('FRAME-DATA: Generating image');

    imageInfo({
      width: this.width,
      height: this.height,
      js: fn
    }, function parseFrameInfo (err, unparsedJson) {
      console.log('FRAME-DATA: Image generated');
      if (err) {
        return cb(err);
      }

      cb(null, unparsedJson);
    });
  },
  finish: function () {
    this.gif.finish();
  }
}, EventEmitter.prototype);

module.exports = GifPerformance;