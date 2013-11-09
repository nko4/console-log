var phantomjssmith = require('../phantomjssmith-hack2');

module.exports = function getImageData (image, width, height, cb) {
  // Convert images into phantomjssmith objects
  var images = [image];
  phantomjssmith.createImages(images, function handleImages (err, imgs) {
    // Create a canvas to draw onto (200 pixels wide, 300 pixels tall)
    phantomjssmith.createCanvas(width, height, function (err, canvas) {
      // Add each image at a specific location (upper left corner = {x, y})
      var coordinatesArr = [{x: 0, y: 0}, {x: 50, y: 50}];
      imgs.forEach(function (img, i) {
        var coordinates = coordinatesArr[i];
        canvas.addImage(img, coordinates.x, coordinates.y);
      }, canvas);

      // Export canvas to image
      canvas['export']({format: 'png'}, function (err, result) {
        cb(null, result); // Binary string representing a PNG image of the canvas
      });
    });
  });
};

if (module.parent === null) {
  module.exports(__dirname + '/test1-orig.jpg', console.log);
}