/*
  GIFEncoder.js

  Authors
  Kevin Weiner (original Java version - kweiner@fmsware.com)
  Thibault Imbert (AS3 version - bytearray.org)
  Johan Nordberg (JS version - code@johan-nordberg.com)
*/

var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var NeuQuant = require('./TypedNeuQuant.js');
var LZWEncoder = require('./LZWEncoder.js');

function ByteArray() {
  // Inherit from EventEmitter
  EventEmitter.call(this);
}

util.inherits(ByteArray, EventEmitter);

ByteArray.prototype.writeByte = function(val) {
  this.emit('data', val);
};

ByteArray.prototype.writeUTFBytes = function(string) {
  for (var l = string.length, i = 0; i < l; i++)
    this.writeByte(string.charCodeAt(i));
};

ByteArray.prototype.writeBytes = function(array, offset, length) {
  for (var l = length || array.length, i = offset || 0; i < l; i++)
    this.writeByte(array[i]);
};

function GIFEncoder(width, height) {
  // Inherit from ByteArray immediately
  ByteArray.call(this);

  // image size
  this.width = ~~width;
  this.height = ~~height;

  // transparent color if given
  this.transparent = null;

  // transparent index in color table
  this.transIndex = 0;

  // -1 = no repeat, 0 = forever. anything else is repeat count
  this.repeat = -1;

  // frame delay (hundredths)
  this.delay = 0;

  this.image = null; // current frame
  this.pixels = null; // BGR byte array from frame
  this.indexedPixels = null; // converted frame indexed to palette
  this.colorDepth = null; // number of bit planes
  this.colorTab = null; // RGB palette
  this.usedEntry = []; // active palette entries
  this.palSize = 7; // color table size (bits-1)
  this.dispose = -1; // disposal code (-1 = use default)
  this.firstFrame = true;
  this.sample = 10; // default sample interval for quantizer
}

util.inherits(GIFEncoder, ByteArray);

/*
  Sets the delay time between each frame, or changes it for subsequent frames
  (applies to last frame added)
*/
GIFEncoder.prototype.setDelay = function(milliseconds) {
  this.delay = Math.round(milliseconds / 10);
};

/*
  Sets frame rate in frames per second.
*/
GIFEncoder.prototype.setFrameRate = function(fps) {
  this.delay = Math.round(100 / fps);
};

/*
  Sets the GIF frame disposal code for the last added frame and any
  subsequent frames.

  Default is 0 if no transparent color has been set, otherwise 2.
*/
GIFEncoder.prototype.setDispose = function(disposalCode) {
  if (disposalCode >= 0) this.dispose = disposalCode;
};

/*
  Sets the number of times the set of GIF frames should be played.

  -1 = play once
  0 = repeat indefinitely

  Default is -1

  Must be invoked before the first image is added
*/

GIFEncoder.prototype.setRepeat = function(repeat) {
  this.repeat = repeat;
};

/*
  Sets the transparent color for the last added frame and any subsequent
  frames. Since all colors are subject to modification in the quantization
  process, the color in the final palette for each frame closest to the given
  color becomes the transparent color for that frame. May be set to null to
  indicate no transparent color.
*/
GIFEncoder.prototype.setTransparent = function(color) {
  this.transparent = color;
};

// Custom methods for performance hacks around streaming GIF data pieces without re-analyzing/loading
GIFEncoder.prototype.analyzeImage = function (imageData) {
  this.image = imageData;

  this.getImagePixels(); // convert to correct format if necessary
  this.analyzePixels(); // build color table & map pixels
};

GIFEncoder.prototype.writeImageInfo = function () {
  if (this.firstFrame) {
    this.writeLSD(); // logical screen descriptior
    this.writePalette(); // global color table
    if (this.repeat >= 0) {
      // use NS app extension to indicate reps
      this.writeNetscapeExt();
    }
  }

  this.writeGraphicCtrlExt(); // write graphic control extension
  this.writeImageDesc(); // image descriptor
  if (!this.firstFrame) this.writePalette(); // local color table

  // DEV: This was originally after outputImage but it does not affect order it seems
  this.firstFrame = false;
};

GIFEncoder.prototype.outputImage = function () {
  this.writePixels(); // encode and write pixel data
};

/*
  Adds next GIF frame. The frame is not written immediately, but is
  actually deferred until the next frame is received so that timing
  data can be inserted.  Invoking finish() flushes all frames.
*/
GIFEncoder.prototype.addFrame = function(imageData) {
  this.emit('frame#start');

  this.analyzeImage(imageData);
  this.writeImageInfo();
  this.outputImage();


  this.emit('frame#stop');
};

/*
  Adds final trailer to the GIF stream, if you don't call the finish method
  the GIF stream will not be valid.
*/
GIFEncoder.prototype.finish = function() {
  this.emit('finish#start');
  this.writeByte(0x3b); // gif trailer
  this.emit('finish#stop');
  this.emit('end');
};

/*
  Sets quality of color quantization (conversion of images to the maximum 256
  colors allowed by the GIF specification). Lower values (minimum = 1)
  produce better colors, but slow processing significantly. 10 is the
  default, and produces good color mapping at reasonable speeds. Values
  greater than 20 do not yield significant improvements in speed.
*/
GIFEncoder.prototype.setQuality = function(quality) {
  if (quality < 1) quality = 1;
  this.sample = quality;
};

/*
  Writes GIF file header
*/
GIFEncoder.prototype.writeHeader = function() {
  this.emit('writeHeader#start');
  this.writeUTFBytes("GIF89a");
  this.emit('writeHeader#stop');
};

/*
  Analyzes current frame colors and creates color map.
*/
GIFEncoder.prototype.analyzePixels = function() {
  var len = this.pixels.length;
  var nPix = len / 3;

  console.log('ANALYZE-UINT: START');
  this.indexedPixels = new Uint8Array(nPix);
  console.log('ANALYZE-UINT: STOP');

  console.log('ANALYZE-INIT-NEU: START');
  var imgq = new NeuQuant(this.pixels, this.sample);
  console.log('ANALYZE-INIT-NEU: STOP');
  console.log('ANALYZE-BUILD-COLOR-MAP: START');
  imgq.buildColormap(); // create reduced palette
  console.log('ANALYZE-BUILD-COLOR-MAP: STOP');
  console.log('ANALYZE-GET-COLOR-MAP: START');
  this.colorTab = imgq.getColormap();
  console.log('ANALYZE-GET-COLOR-MAP: STOP');

  // console.log(JSON.stringify(this.colorTab));

  // map image pixels to new palette
  console.log('ANALYZE-MATCH-COLORS: START');
  var k = 0;
  for (var j = 0; j < nPix; j++) {
    var index = imgq.lookupRGB(
      this.pixels[k++] & 0xff,
      this.pixels[k++] & 0xff,
      this.pixels[k++] & 0xff
    );
    this.usedEntry[index] = true;
    this.indexedPixels[j] = index;
  }
  console.log('ANALYZE-MATCH-COLORS: STOP');

  console.log('ANALYZE-EXCESS: START');
  this.pixels = null;
  this.colorDepth = 8;
  this.palSize = 7;

  // get closest match to transparent color if specified
  if (this.transparent !== null) {
    this.transIndex = this.findClosest(this.transparent);
  }
  console.log('ANALYZE-EXCESS: STOP');
};

/*
  Returns index of palette color closest to c
*/
GIFEncoder.prototype.findClosest = function(c) {
  if (this.colorTab === null) return -1;

  var r = (c & 0xFF0000) >> 16;
  var g = (c & 0x00FF00) >> 8;
  var b = (c & 0x0000FF);
  var minpos = 0;
  var dmin = 256 * 256 * 256;
  var len = this.colorTab.length;

  for (var i = 0; i < len;) {
    var dr = r - (this.colorTab[i++] & 0xff);
    var dg = g - (this.colorTab[i++] & 0xff);
    var db = b - (this.colorTab[i] & 0xff);
    var d = dr * dr + dg * dg + db * db;
    var index = i / 3;
    if (this.usedEntry[index] && (d < dmin)) {
      dmin = d;
      minpos = index;
    }
    i++;
  }

  return minpos;
};

/*
  Extracts image pixels into byte array pixels
  (removes alphachannel from canvas imagedata)
*/
GIFEncoder.prototype.getImagePixels = function() {
  var w = this.width;
  var h = this.height;
  this.pixels = new Uint8Array(w * h * 3);

  var data = this.image;
  var count = 0;

  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      var b = (i * w * 4) + j * 4;
      this.pixels[count++] = data[b];
      this.pixels[count++] = data[b+1];
      this.pixels[count++] = data[b+2];
    }
  }
};

GIFEncoder.prototype._pixelHack = function(data) {
  var w = this.width;
  var h = this.height;
  this.pixels = new Uint8Array(w * h * 3);

  var count = 0;

  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      var b = (i * w * 4) + j * 4;
      this.pixels[count++] = data.charCodeAt(b) - 33;
      this.pixels[count++] = data.charCodeAt(b+1) - 33;
      this.pixels[count++] = data.charCodeAt(b+2) - 33;
    }
  }
};

/*
  Writes Graphic Control Extension
*/
GIFEncoder.prototype.writeGraphicCtrlExt = function() {
  this.writeByte(0x21); // extension introducer
  this.writeByte(0xf9); // GCE label
  this.writeByte(4); // data block size

  var transp, disp;
  if (this.transparent === null) {
    transp = 0;
    disp = 0; // dispose = no action
  } else {
    transp = 1;
    disp = 2; // force clear if using transparent color
  }

  if (this.dispose >= 0) {
    disp = dispose & 7; // user override
  }
  disp <<= 2;

  // packed fields
  this.writeByte(
    0 | // 1:3 reserved
    disp | // 4:6 disposal
    0 | // 7 user input - 0 = none
    transp // 8 transparency flag
  );

  this.writeShort(this.delay); // delay x 1/100 sec
  this.writeByte(this.transIndex); // transparent color index
  this.writeByte(0); // block terminator
};

/*
  Writes Image Descriptor
*/
GIFEncoder.prototype.writeImageDesc = function() {
  this.writeByte(0x2c); // image separator
  this.writeShort(0); // image position x,y = 0,0
  this.writeShort(0);
  this.writeShort(this.width); // image size
  this.writeShort(this.height);

  // packed fields
  if (this.firstFrame) {
    // no LCT - GCT is used for first (or only) frame
    this.writeByte(0);
  } else {
    // specify normal LCT
    this.writeByte(
      0x80 | // 1 local color table 1=yes
      0 | // 2 interlace - 0=no
      0 | // 3 sorted - 0=no
      0 | // 4-5 reserved
      this.palSize // 6-8 size of color table
    );
  }
};

/*
  Writes Logical Screen Descriptor
*/
GIFEncoder.prototype.writeLSD = function() {
  // logical screen size
  this.writeShort(this.width);
  this.writeShort(this.height);

  // packed fields
  this.writeByte(
    0x80 | // 1 : global color table flag = 1 (gct used)
    0x70 | // 2-4 : color resolution = 7
    0x00 | // 5 : gct sort flag = 0
    this.palSize // 6-8 : gct size
  );

  this.writeByte(0); // background color index
  this.writeByte(0); // pixel aspect ratio - assume 1:1
};

/*
  Writes Netscape application extension to define repeat count.
*/
GIFEncoder.prototype.writeNetscapeExt = function() {
  this.writeByte(0x21); // extension introducer
  this.writeByte(0xff); // app extension label
  this.writeByte(11); // block size
  this.writeUTFBytes('NETSCAPE2.0'); // app id + auth code
  this.writeByte(3); // sub-block size
  this.writeByte(1); // loop sub-block id
  this.writeShort(this.repeat); // loop count (extra iterations, 0=repeat forever)
  this.writeByte(0); // block terminator
};

/*
  Writes color table
*/
GIFEncoder.prototype.writePalette = function() {
  this.writeBytes(this.colorTab);
  var n = (3 * 256) - this.colorTab.length;
  for (var i = 0; i < n; i++)
    this.writeByte(0);
};

GIFEncoder.prototype.writeShort = function(pValue) {
  this.writeByte(pValue & 0xFF);
  this.writeByte((pValue >> 8) & 0xFF);
};

/*
  Encodes and writes pixel data
*/
GIFEncoder.prototype.writePixels = function() {
  var enc = new LZWEncoder(this.width, this.height, this.indexedPixels, this.colorDepth);
  enc.encode(this);
};

/*
  Retrieves the GIF stream
*/
GIFEncoder.prototype.stream = function() {
  return this;
};

GIFEncoder.ByteArray = ByteArray;

module.exports = GIFEncoder;
