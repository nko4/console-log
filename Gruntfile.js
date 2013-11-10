module.exports = function (grunt) {
  // Configure the project
  grunt.initConfig({
    jshint: {
      client: ['public/js/main.js']
    },
    curl: {
    },
    'curl-dir': {
      'tmp/': [
      ]
    },
    unzip: {
    },
    copy: {
    },
    watch: {
      js: {
        files: 'public/js/**/*.js',
        tasks: 'js'
      }
    }
  });

  // Load in grunt dependencies
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-zip');

  // Register dependency tasks
  grunt.registerTask('install', ['curl', 'unzip', 'copy']);

  // Register css and js tasks
  grunt.registerTask('lint', ['jshint']);

  // Set up default action
  grunt.registerTask('default', ['lint']);
};