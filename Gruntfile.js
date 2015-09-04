module.exports = function(grunt) {

  grunt.initConfig({
    run: {
      options: {
        // Task-specific options go here.
      },
      lab: {
        cmd: 'npm',
        args: [
          'test'
        ]
      }
    },
    watch: {
      files: ['test/**/*.js','server/**/*.js'],
      tasks: ['run:lab']
    }
  });

  // grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-run');

  grunt.registerTask('default', ['lab']);

};
