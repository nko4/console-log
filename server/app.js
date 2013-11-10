var express = require('express');

var routes = require('./routes');

// TODO: Debug single quotes in URLs

module.exports = function gifServer (port) {

  // Keep track of array of connections
  var firstConnections = [];
  var secondConnections = [];

  // Start a server that runs on jade
  var app = express();

  // Host static files
  app.use('/public', express['static'](__dirname + '/../public'));

  // Set up connections for server logic
  app.use(function saveConnections (req, res, next) {
    req.firstConnections = firstConnections;
    req.secondConnections = secondConnections;
    next();
  });

  // Host homepage
  app.get('/', routes.index);

  // Server logic
  app.get('/image.gif', routes.openImage);
  app.post('/image/text', routes.writeTextToImage);
  app.post('/image/raw', routes.writeRawToImage);

  // Host 404 page
  app.all('*', routes[404]);

  // Listen and notify the outside world
  app.listen(port);
  console.log('gifsockets server is listening at http://127.0.0.1:' + port + '/');
};

if (module.parent === null) {
  module.exports(7000);
}
