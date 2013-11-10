var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var extend = require('obj-extend');

var GifEncoder = require('../lib/gif.js/GIFEncoder');
var imageInfo = require('../lib/image-info');
function noop() {}

// TODO: This should extend from GifEncoder
function GifDuplex(options) {
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

  var activeData = [];
  gif.on('data', function (val) {
    activeData.push(val);
  });
  function outputActiveData() {
    var buffer = new Buffer(activeData);
    activeData = [];
    // TODO: This is here because we writeHeader on init
    process.nextTick(function () {
      that.emit('data', buffer);
    });
  }
  gif.on('writeHeader#stop', outputActiveData);
  gif.on('frame#stop', outputActiveData);
  gif.on('finish#stop', function () {
    outputActiveData();

    gif.on('end', function () {
      process.nextTick(function () {
        that.emit('end');
      });
    });
  });

  // TODO: These should be methods...?
  // Open the gif
  gif.writeHeader();

  // Configure the gif
  // gif.setDelay(100);
  // gif.setRepeat(0);
  gif.setQuality(options.quality || 10);

  // Save gif for methods
  this.gif = gif;
}
GifDuplex.prototype = extend({
  writeFrameData: function (dataArr) {
    console.log('Outputting frame');
    this.gif.addFrame(dataArr);
  },
  getTextFrameData: function (text, cb) {
    function drawImage(cb) {
      context.font = '30px Impact';
      context.fillStyle = '#FFFFFF';
      context.fillText('TEXT', 50, 100);
      cb(null);
    }

    cb = cb || noop;
    var fn = (drawImage + '')
              .replace('TEXT', text)
              .replace('function drawImage(cb) {', '')
              .replace(/\}$/, '');

    // TODO: Performance improvment: phantomjs HTTP server
    // Dodges starting a new process each time
    // Prevents EMFILE (file descriptor limit)

    console.log('Generating image');

    imageInfo({
      width: this.width,
      height: this.height,
      js: fn
    }, function parseFrameInfo (err, unparsedJson) {
      if (err) {
        return cb(err);
      }
      console.log('Parsing image data');

      // TODO: Can imageInfo stream out smaller chunks of data?
      var dataArr = JSON.parse(unparsedJson);
      cb(null, dataArr);
    });
  },
  writeTextFrame: function (text, cb) {
    var that = this;
    this.getTextFrameData(text, function (err, dataArr) {
      if (err) {
        return cb(err);
      }

      that.writeFrameData(dataArr);

      cb(null);
    });
  },
  finish: function () {
    this.gif.finish();
  }
}, EventEmitter.prototype);

module.exports = GifDuplex;