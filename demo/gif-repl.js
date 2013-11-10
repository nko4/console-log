var readline = require('readline');

if (module.parent === null) {
  // Keep track of array of connections
  // When we get a readline, genreate a text frame for each connection

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function prompt() {
    rl.question('Enter text> ', function (answer) {
      console.log('Echo: ' + answer);
      prompt();
    });
  }
  prompt();

  // TODO: Create streaming server via duplex (scrapping gif-generate)
  // var gifDuplex = new GifDuplex();

  // async.eachSeries([
  //   'Hello',
  //   'Hello World',
  //   'Hello World!',
  //   'Hello World!!!'
  // ], function addTextFrame (text, cb) {
  //   gifDuplex.writeTextFrame(text, cb);
  // }, function handleTextError (err) {
  //   if (err) {
  //     throw err;
  //   }

  //   // Complete the gif
  //   gifDuplex.finish();
  // });

  // gifDuplex.on('data', function (buff) {
  //   stream.write(buff);
  // });
}