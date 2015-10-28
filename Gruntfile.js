module.exports = function(grunt) {

  grunt.initConfig({
    run: {
      options: {
        // Task-specific options go here.
      },
      lab: {
        cmd: 'npm',
        args: [
          'run',
          'test-unit'
        ]
      }
    },
    watch: {
      files: ['test/**/*.js','server/**/*.js'],
      tasks: ['run:lab']
    },
    uglify: {
      my_target: {
        files: {
          'client/public/lummox.min.js': ['client/src/app/app.js']
        }
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'client/public/lummox.min.css':
          [
            'client/src/dashgum/assets/css/bootstrap.css',
            'client/src/dashgum/assets/font-awesome/css/font-awesome.css',
            'client/src/dashgum/assets/css/style.css',
            'client/src/dashgum/assets/css/style-responsive.css',
            'client/src/watable/watable.css',
            'client/src/watable/datepicker.css',
            'client/src/select2/select2.css',
          ],
        }
      }
    },
    htmlmin: {                                     // Task
      dist: {                                      // Target
        options: {                                 // Target options
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'client/public/index.html': 'client/src/index.html',
          'client/public/login.html': 'client/src/login.html',
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-run');

  grunt.registerTask('default', ['lab']);

};
