// Load in modules
var system = require('system'),
    fs = require('fs'),
    webpage = require('webpage');

// Grab the arguments
var args = system.args,
    filepath = args[1],
    encodedArg = fs.read(filepath);

// If there is no image, throw an error
if (!encodedArg) {
  throw new Error('No argument was specified.');
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
console.log('asd', dataUrl);
  // Output the dataUrl
  console.log(dataUrl);

  // Leave the program
  phantom.exit();
});
