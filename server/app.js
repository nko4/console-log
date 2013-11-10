var http = require('http');

var routes = require('./routes');

// TODO: Debug single quotes in URLs

module.exports = function gifRepl (port) {

  // Keep track of array of connections
  var firstConnections = [];
  var secondConnections = [];

  var app = http.createServer(function (req, res) {
    req.firstConnections = firstConnections;
    req.secondConnections = secondConnections;
    if (req.method === 'POST') {
      routes.writeToImage(req, res);
    } else {
      routes.openImage(req, res);
    }
  });

  app.listen(port);
  console.log('gifsockets server is listening at http://127.0.0.1:' + port + '/');
};

if (module.parent === null) {
  module.exports(7000);
}
