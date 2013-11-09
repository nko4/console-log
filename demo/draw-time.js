// https://github.com/TooTallNate/ansi-canvas/blob/master/examples/time.js
var tc = require('ansi-canvas');

// create terminal <canvas>
var canvas = tc();
var ctx = canvas.getContext('2d');

// require('ansi')(process.stdout).hide();

var x = 0;
var y = 0;

var fps = 0;
var now, lastUpdate = new Date();

function render () {

  // console.log('hai');

  // clear previous data
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // black background
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // // print height and width
  // ctx.font = '12px Arial';
  // ctx.textBaseline = 'top';
  // ctx.fillStyle = 'red';
  // ctx.fillText('w: ' + canvas.width + ', h: ' + canvas.height, 0, 0);
  // ctx.fillText(new Date().toISOString(), 0, 15);

  // frames per second
  var thisFrameFPS = 1000 / ((now = new Date()) - lastUpdate);
  fps += (thisFrameFPS - fps);
  lastUpdate = now;
  // console.log(fps.toFixed(2));

  ctx.font = '10px Arial';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'blue';
  ctx.fillText('FPS: ' + fps.toFixed(2), 0, 30);

  // render to TTY
  canvas.render();
}

process.stdout.on('resize', render);

setInterval(render, 1000 / 60); // 60hz
//render();

function show () {
  // require('ansi')(process.stdout).show();
  process.exit();
}
process.on('exit', show);
process.on('SIGINT', show);