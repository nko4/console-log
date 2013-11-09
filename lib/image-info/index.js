var assert = require('assert'),
    path = require('path'),
    spawn = require('child_process').spawn,
    Tempfile = require('temporary/lib/file'),
    which = require('which'),
    phantomLocation = which.sync('phantomjs');

module.exports = function getImageInfo (params, cb) {
  assert(params.js, 'JS not provided');
  assert(params.width, 'Width not provided');
  assert(params.height, 'Height not provided');

  // TODO: Consider passing a function or vanilla JS

  // Stringify our argument for phantomjs
  var arg = JSON.stringify(params),
      encodedArg = encodeURIComponent(arg);

  // Write out argument to temporary file -- streams weren't cutting it
  var tmp = new Tempfile(),
      filepath = tmp.path;
  tmp.writeFileSync(encodedArg, 'utf8');

  // Create a child process for phantomjs
  var phantomjs = spawn(phantomLocation, [__dirname + '/phantomjs/compose.js', filepath]);

  // When there is data, save it
  var retVal = '';
  phantomjs.stdout.on('data', function (buffer) {
    // Return the buffered output
    retVal += buffer.toString().trim();
  });

  // When there is an error, concatenate it
  var err = '';
  phantomjs.stderr.on('data', function (buffer) {
    // Ignore PhantomJS 1.9.2 OSX errors
    // https://github.com/Ensighten/grunt-spritesmith/issues/33
    var bufferStr = buffer + '',
        isNot192OSXError = bufferStr.indexOf('WARNING: Method userSpaceScaleFactor') === -1,
        isNotPerformanceNote = bufferStr.indexOf('CoreText performance note:') === -1;
    if (isNot192OSXError && isNotPerformanceNote) {
      err += bufferStr;
    }
  });

  // When we are done
  phantomjs.on('close', function () {
    // Destroy the temporary file
    try { tmp.unlinkSync(); } catch (e) {}

    // If there was an error in phantom, callback with it
    if (err) {
      cb(new Error(err));
    }

    // Otherwise, callback with our retVal
    cb(null, retVal);
  });
};
