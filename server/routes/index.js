exports.openImage = function openImage (req, res) {
  console.log('CONNECTION-ADDED');
  res.writeHead(200, {
    'connection': 'keep-alive',
    'content-type': 'image/gif',
    'transfer-encoding': 'chunked'
  });

  req.firstConnections.push({
    res: res
  });
};

exports.writeTextToImage = require('./writeTextToImage');
exports.writeRawToImage = require('./writeRawToImage');

// Render some jade into memory
var fs = require('fs');
var jade = require('jade');
function renderView(filepath, locals) {
  var file = fs.readFileSync(filepath, 'utf8');
  return jade.render(file, locals);
}

// TODO: Relocate indexHtml back to here
exports.index = function (req, res) {
var indexHtml = renderView(__dirname + '/../../views/index.jade', {});
  res.send(indexHtml);
};

var pageNotFoundHtml = renderView(__dirname + '/../../views/404.jade', {});
exports[404] = function (req, res) {
  res.status(404);
  res.send(pageNotFoundHtml);
};
