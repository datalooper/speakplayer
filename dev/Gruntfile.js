module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
      shell: {
          renderHBS: {
              command: 'handlebars public/hb/*.* -f ../trunk/public/js/renderedTemplates.js'
          }
      },
    sass: {
      dist: {
        options: {
          style: 'expanded',
          sourcemap: 'inline'
        },
        files: {
          '../trunk/public/css/speakplayer-public.css': 'public/scss/app.scss'
        }
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
        'public/js/*.js','public/js/backbone.marionette.min.js','public/js/modules/Speakplayer.js', 'public/js/modules/*.js'
        ],

        dest: '../trunk/public/js/speak_sound_library-public.js'
      }

    },
    autoprefixer: {
      dist: {
        files: {
          'css/app.css': 'css/app.css'
        }
      }
    },
    watch: {
      options: {
        livereload : true
      },
      grunt: { files: ['Gruntfile.js'] },
      sass: {
        files: 'public/scss/*.scss',
        tasks: ['sass']

      },
    shell: {
        files : 'public/hb/*.*',
        tasks: ['shell']
    },
      concat: {
        files: ['public/js/*.js','public/js/modules/*.js'],
        tasks: 'compileJS',
        options: {
          spawn: false,
        }
      }
    }
  });

grunt.loadNpmTasks('grunt-contrib-sass');
grunt.loadNpmTasks('grunt-shell');
grunt.loadNpmTasks('grunt-autoprefixer');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-uglify');

grunt.registerTask('build', ['sass']);
grunt.registerTask('default', ['concat', 'watch', 'shell:renderHBS']);
grunt.registerTask('compileJS',['concat:dist']);

}