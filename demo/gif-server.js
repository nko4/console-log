var http = require('http');
var fs = require('fs');

var app = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'image/gif'});
  var gif = fs.createReadStream(__dirname + '/test.gif');
  gif.pipe(res);
});

var port = 7000;
app.listen(port);
console.log('gifsockets server is listening at http://127.0.0.1:7000/');
