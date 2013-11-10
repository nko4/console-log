# console-log

Mothereffing GIFSockets!!!

[GIFSockets][] were originally written in [Clojure][],
using [Java][] libraries for [GIF][] encoding.

[GIFSockets]: https://github.com/videlalvaro/gifsockets
[Clojure]: http://en.wikipedia.org/wiki/Clojure
[Java]: http://en.wikipedia.org/wiki/Java_%28programming_language%29
[GIF]: http://en.wikipedia.org/wiki/Graphics_Interchange_Format

Unfortunately, it was not trivial to set up.
Especially if you have not had experience with
[Clojure][] in the past.

This project is a reimplementation in [JavaScript][]
using a fork of [gif.js][] for encoding and
[PhantomJS][] for [canvas][] preparation.

[JavaScript]: http://en.wikipedia.org/wiki/ECMAScript
[gif.js]: http://jnordberg.github.io/gif.js/
[PhantomJS]: http://phantomjs.org/
[canvas]: https://developer.mozilla.org/en-US/docs/HTML/Canvas

To run this website locally:

```bash
git clone https://github.com/nko4/console-log
cd console-log
npm install
npm run start-phantomjs &
npm start
# Website will be available at http://localhost:8000/
```

## Documentation
This code was written during [Node Knockout 2013][], a 48 hour hackathon, so it is not the best organized.

[Node Knockout 2013]: http://2013.nodeknockout.com/

The server you are running is at `server/app.js` and the `gif` logic is inside of `lib`.

## Donating
Support this project and [others by twolfson][gittip] via [gittip][].

[![Support via Gittip][gittip-badge]][gittip]

[gittip-badge]: https://rawgithub.com/twolfson/gittip-badge/master/dist/gittip.png
[gittip]: https://www.gittip.com/twolfson/

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## Unlicense
As of Nov 10 2013, Todd Wolfson has released this repository and its contents to the public domain.

It has been released under the [UNLICENSE][].

[UNLICENSE]: UNLICENSE
