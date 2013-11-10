module.exports = function (grunt) {
  // Configure the project
  grunt.initConfig({
    jshint: {
      client: ['public/js/main.js']
    },
    'curl-dir': {
      'public/js/': [
        'https://raw.github.com/bgrins/filereader.js/60699e42b380c049fb32c1c259b69c4b792ba79e/filereader.js',
        'https://raw.github.com/bgrins/filereader.js/60699e42b380c049fb32c1c259b69c4b792ba79e/filereader.min.js',
        'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.js'
      ],
      'tmp/': [
        'http://getbootstrap.com/2.3.2/assets/bootstrap.zip',
        'http://subtlepatterns.com/patterns/ps_neutral.zip',
        'https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png'
      ]
    },
    unzip: {
      bootstrap: {
        src: 'tmp/bootstrap.zip',
        dest: 'public/',
        router: function (filepath) {
          return filepath.replace('bootstrap/', '');
        }
      },
      background: {
        src: 'tmp/ps_neutral.zip',
        dest: 'tmp/ps_neutral/'
      }
    },
    copy: {
      'public/img/background.png': 'tmp/ps_neutral/ps_neutral/ps_neutral.png',
      'public/img/github-ribbon.png': 'tmp/forkme_right_orange_ff7600.png'
    },
    watch: {
      js: {
        files: 'public/js/**/*.js',
        tasks: 'js'
      }
    }
  });

  // Load in grunt dependencies
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-zip');

  // Register dependency tasks
  grunt.registerTask('install', ['curl-dir', 'unzip', 'copy']);

  // Register css and js tasks
  grunt.registerTask('lint', ['jshint']);

  // Set up default action
  grunt.registerTask('default', ['lint']);
};