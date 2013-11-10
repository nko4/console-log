var assert = require('assert');
var path = require('path');
var spawn = require('child_process').spawn;

var Tempfile = require('temporary/lib/file');
var request = require('request');
var which = require('which');
var phantomLocation = which.sync('phantomjs');

module.exports = function getImageInfo (params, cb) {
  assert(params.js, 'JS not provided');
  assert(params.width, 'Width not provided');
  assert(params.height, 'Height not provided');

  // TODO: Consider passing a function or vanilla JS

  // Stringify our argument for phantomjs
  var arg = JSON.stringify(params),
      encodedArg = encodeURIComponent(arg);

  assert(encodedArg.length < 4096, 'JavaScript is over 4096 characters when encoded');

  request({
    url: 'http://localhost:9090/',
    method: 'POST',
    // body: encodedArg
    form: {
      'tmp': 'test'
    }
  }, function handlePhantomResponse(err, res, body) {
    console.log(res);
    // If there was an error, callback with it
    if (err) {
      return cb(err);
    }

    // If there was a bad status code, callback with a good message
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return cb(new Error('PhantomJS server responded with "' + res.statusCode + '" status code. ' + body));
    }

    // Otherwise, callback with the body
    cb(null, body);
  });

  // // Create a child process for phantomjs
  // var phantomjs = spawn(phantomLocation, [__dirname + '/phantomjs/compose.js', filepath]);

  // // When there is data, save it
  // var retVal = '';
  // phantomjs.stdout.on('data', function (buffer) {
  //   // Return the buffered output
  //   retVal += buffer.toString().trim();
  // });

  // // When there is an error, concatenate it
  // var err = '';
  // phantomjs.stderr.on('data', function (buffer) {
  //   // Ignore PhantomJS 1.9.2 OSX errors
  //   // https://github.com/Ensighten/grunt-spritesmith/issues/33
  //   var bufferStr = buffer + '',
  //       isNot192OSXError = bufferStr.indexOf('WARNING: Method userSpaceScaleFactor') === -1,
  //       isNotPerformanceNote = bufferStr.indexOf('CoreText performance note:') === -1;
  //   if (isNot192OSXError && isNotPerformanceNote) {
  //     err += bufferStr;
  //   }
  // });

  // // When we are done
  // phantomjs.on('close', function () {
  //   // Destroy the temporary file
  //   try { tmp.unlinkSync(); } catch (e) {}

  //   // If there was an error in phantom, callback with it
  //   if (err) {
  //     cb(new Error(err));
  //   }

  //   // Otherwise, callback with our retVal
  //   cb(null, retVal);
  // });
};
