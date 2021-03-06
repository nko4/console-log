var assert = require('assert');
var path = require('path');
var spawn = require('child_process').spawn;

var async = require('async');
var Tempfile = require('temporary/lib/file');
var request = require('request');
var which = require('which');
var phantomLocation = which.sync('phantomjs');
function noop() {}

// DEV: This is a horrible way to organize code. Nothing like this should be run at require time
var serverIsRunning = false;
var pendingReqs = [];
var queue = async.queue(function (params, cb) {
  var requestCb = params.cb;
  delete params.cb;
  request(params, function (err, res, body) {
    requestCb(err, res, body);
    cb();
  });
}, 1);

async.whilst(
  function checkServerIsRunning () {
    return !serverIsRunning;
  },
  function getServerStatus (cb) {
    request({
      url: 'http://localhost:9090/'
    }, function (err, res, body) {
      serverIsRunning = !err && res.statusCode >= 200 && res.statusCode < 300;
      cb();
    });
  },
  function flushQueue() {
    pendingReqs.forEach(function (pendingReq) {
      queue.push(pendingReq, noop);
    });
  }
);

function makeRequest(params) {
  if (serverIsRunning) {
    queue.push(params, noop);
  } else {
    pendingReqs.push(params);
  }
}

module.exports = function getImageInfo (params, cb) {
  assert(params.js, 'JS not provided');
  assert(params.width, 'Width not provided');
  assert(params.height, 'Height not provided');

  // TODO: Consider passing a function or vanilla JS

  // Stringify our argument for phantomjs
  var arg = JSON.stringify(params),
      encodedArg = encodeURIComponent(arg);

  // DEV: It seems to work without this (automatic truncation) =D
  // assert(encodedArg.length < 4096, 'JavaScript is over 4096 characters when encoded');

  makeRequest({
    url: 'http://localhost:9090/',
    method: 'POST',
    headers: {
      // DEV: PhantomJS looks for Proper-Case headers, request is lower-case =(
      'Content-Length': encodedArg.length
    },
    body: encodedArg,
    cb: function handlePhantomResponse(err, res, body) {
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
    }
  });
};
