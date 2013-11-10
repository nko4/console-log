// Load in modules
var fs = require('fs');
var system = require('system');
var server = require('webserver').create();
var webpage = require('webpage');

var app = server.listen(9090, function (req, res) {
  res.statusCode = 200;
  res.write('IT\'S ALIVE!');
  res.close();
});

function getImageData(req, res) {
  // Grab the arguments
  var args = system.args;
  var filepath = args[1];
  var encodedArg = fs.read(filepath);

  // If there is no image, throw an error
  if (!encodedArg) {
    cb(new Error('No argument was specified.'));
  }

  // Load the compose webpage
  var page = webpage.create();

  page.onConsoleMessage = function (msg) {
    console.log(msg);
  };

  page.addCookie({
    'name': 'PARAMS',
    'value': encodedArg
  });

  page.open(phantom.libraryPath + '/compose.html', function (status) {
    // Pluck out the data png
    var dataUrl = page.evaluate(function () {
      return window.retStr;
    });

    // Output the dataUrl
    cb(null, dataUrl);
  });
}
