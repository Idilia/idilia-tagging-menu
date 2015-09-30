(function () {
  'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('bower.json'),
    // Task configuration.
    clean: {
      files: ['dist']
    },

    // All original files are copied as is in distribution
    copy: {
      main: {
        expand: true,
        cwd: 'src',
        src: ['*.js', '*.css'],
        dest: 'dist/'
      }
    },

    // bundled version built in distribution
    concat: {
      bundle_sense_menu_js: {
        src: ['src/jquery.sense_card.js', 'src/jquery.sense_menu.js'],
        dest: 'dist/jquery.sense_menu.bundle.js'
      },
      bundle_sense_menu_css: {
        src: ['src/sensecard.css', 'src/jquery.sense_menu.css'],
        dest: 'dist/jquery.sense_menu.bundle.css'
      },
      bundle_tagging_menu_js: {
        src: ['dist/jquery.sense_menu.bundle.js', 'src/jquery.tagging_menu.js'],
        dest: 'dist/jquery.tagging_menu.bundle.js'
      },
      bundle_tagging_menu_css: {
        src: ['dist/jquery.sense_menu.bundle.css', 'src/jquery.tagging_menu.css'],
        dest: 'dist/jquery.tagging_menu.bundle.css'
      }
    },

    uglify: {
      files: {
        expand: true,
        extDot: 'last',
        ext: '.min.js',
        src: ['dist/*.js', '!dist/*.min.js']
      }
    },

    cssmin: {
      files: {
        expand: true,
        extDot: 'last',
        ext: '.min.css',
        src: ['dist/*.css', '!dist/*.min.css']
      }
    },

    csslint: {
      options: {
        'important': false,
        'adjoining-classes': false,
        'box-sizing': false
      },
      src: ['src/**/*.css']
    },

    jshint: {
      options: {
        jshintrc: true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['src/**/*.js']
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task.
  grunt.registerTask('default', ['csslint', 'jshint', 'clean', 'copy', 'concat', 'cssmin', 'uglify']);
};

}());

