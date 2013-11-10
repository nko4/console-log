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
};

// Grab port
var args = system.args;
var port = args[1] || 9090;

// Start a server
var app = server.listen(9090, function (req, res) {
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

function getImageData(req, res) {
  // Grab the post data
  var encodedArg = req.postRaw;
  console.log(JSON.stringify(req.headers));
  console.log('POST ' + !!req.post);
  console.log('POST RAW ' + !!req.postRaw);
  if (!req.postRaw) {
    res.statusCode = 400;
    res.write('No POST data was found');
    return res.close();
  }

  console.log('PHANTOMJS: Creating page');

  // Load the compose webpage
  var page = webpage.create();

  page.onError = function (msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.error(msgStack.join('\n'));

    res.statusCode = 500;
    res.write('An error occurred on the page');
    res.close();
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
