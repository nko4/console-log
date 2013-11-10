// sv setup
// cp /etc/service/serverjs /etc/service/phantomserver
// pico /etc/service/phantomserver/run

// #!/bin/sh
// exec 2>&1
// . /etc/profile
// . /home/deploy/.profile
// cd /home/deploy/current
// pkill phantomjs # ugh, hacks =_=
// exec npm run start-phantomjs

// pico /etc/service/phantomserver/log/run

// #!/bin/sh
// exec svlogd -tt /home/deploy/shared/logs/phantomserver

// mkdir /home/deploy/shared/logs/phantomserver
// chown deploy /etc/service/phantomserver/supervise/
// chown deploy /etc/service/phantomserver/supervise/control
// chown deploy /etc/service/phantomserver/supervise/lock
// chown deploy /etc/service/phantomserver/supervise/ok

// Load in modules
var fs = require('fs');
var system = require('system');
var server = require('webserver').create();
var webpage = require('webpage');

// Log all errors
phantom.onError = function (msg, trace) {
  var msgStack = ['ERROR: ' + msg];
  if (trace && trace.length) {
      msgStack.push('TRACE:');
      trace.forEach(function(t) {
          msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
      });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};

// Grab port
var args = system.args;
var port = args[2] || 9090;

// Start a server
var app = server.listen(port, function (req, res) {
  // If it's a POST request, collect image data
  if (req.method === 'POST') {
    getImageData(req, res);
  // Otherwise, send health status
  } else {
    res.statusCode = 200;
    res.write('IT\'S ALIVE!');
    res.close();
  }
});

console.log('PhantomJS server is running at http://127.0.0.1:' + port + '/');

function getImageData(req, res) {
  // Grab the post data
  var encodedArg = req.postRaw || req.post;
  if (!encodedArg) {
    res.statusCode = 400;
    res.write('No POST data was found');
    return res.close();
  }

  console.log('PHANTOMJS: Creating page');

  // Load the compose webpage
  var page = webpage.create();
  var errorEncountered = false;
  page.onError = function (msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    if (!errorEncountered) {
      res.statusCode = 500;
      res.write('An error occurred on the page');
      res.close();
      errorEncountered = true;
    }
  };

  page.onConsoleMessage = function (msg) {
    console.log(msg);
  };

  console.log('PHANTOMJS: Adding cookie');

  // TODO: This is horribly inefficient and sloppy
  page.addCookie({
    'name': 'PARAMS',
    'value': encodedArg
  });

  console.log('PHANTOMJS: Opening page');

  page.open(phantom.libraryPath + '/compose.html', function (status) {
    if (errorEncountered) {
      return;
    }

    console.log('PHANTOMJS: Extracting data');

    // Pluck out the data png
    var dataUrl = page.evaluate(function () {
      return window.retStr;
    });

    console.log('PHANTOMJS: Writing response');

    // Output the dataUrl
    res.statusCode = 200;
    res.write(dataUrl);
    res.close();
  });
}
