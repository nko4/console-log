var assert = require('assert');
var path = require('path');
var spawn = require('child_process').spawn;

var Tempfile = require('temporary/lib/file');
var request = require('request');
var which = require('which');
var phantomLocation = which.sync('phantomjs');

// DEV: This is a horrible way to organize code. Nothing like this should be run at require time
var phantomServer = spawn(phantomLocation, [__dirname + '/phantomjs/compose.js'],  {customFds: [0, 1, 2]});

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
    headers: {
      // DEV: PhantomJS looks for Proper-Case headers, request is lower-case =(
      'Content-Length': encodedArg.length
    },
    body: encodedArg
  }, function handlePhantomResponse(err, res, body) {
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
};

function cleanupPhantomServer() {
  console.log('exiting');
  phantomServer.kill(function () {
    process.removeListener('exit', cleanupPhantomServer);
  });
}
process.on('exit', cleanupPhantomServer);

// Request immediately
module.exports(
{"width":600,"height":392,"js":"\n      context.font = '30px Impact';\n      context.fillStyle = '#FFFFFF';\n      context.fillText('hi', 50, 100);\n      cb(null);\n    "}
, function (err, body) {
  console.log('ERR', err);
  console.log('body', !!body);
});
