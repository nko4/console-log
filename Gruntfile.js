module.exports = function (grunt) {
  // Configure the project
  grunt.initConfig({
    jshint: {
      client: ['public/js/main.js']
    },
    'curl-dir': {
      'tmp/': [
        'http://getbootstrap.com/2.3.2/assets/bootstrap.zip',
        'http://subtlepatterns.com/patterns/dimension.zip'
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
        src: 'tmp/dimension.zip',
        dest: 'tmp/dimension/'
      }
    },
    copy: {
      background: {
        src: 'tmp/dimension/dimension/dimension.png',
        dest: 'public/img/dimension.png'
      }
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