// DEV: This will be re-used on the client side when we have drag and drop
var options = {width: 200, height: 200};

var ctx;

if (!window._canvas) {
  _canvas = document.createElement('canvas');
  _canvas.width = options.width;
  _canvas.height = options.height;
}

ctx = _canvas.getContext('2d');

ctx.setFill = options.background;

ctx.fillRect(0, 0, options.width, options.height);

// ctx.drawImage(image, 0, 0);
ctx.drawImage($0, 0, 0);

// return getContextData(ctx);

// return ctx.getImageData(0, 0, options.width, options.height).data;
console.log( ctx.getImageData(0, 0, options.width, options.height).data );