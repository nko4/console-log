var ac = require('ansi-canvas');

var canvas = ac();
var context = canvas.getContext('2d');

// draw a purple background
context.fillStyle = 'purple';
context.fillRect(0, 0, canvas.width, canvas.height);

// write some text
context.fillStyle    = '#00f';
context.font         = 'italic 15px sans-serif';
context.textBaseline = 'top';
context.fillText  ('Hello world!', 1, 1);
context.font         = 'bold 20px sans-serif';
context.strokeText('Hello world!', 1, 21);

// IMPORTANT!!!
// call `canvas.render()` when you're ready to flush the canvas to the terminal
canvas.render();