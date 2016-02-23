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
        'public/js/app/Speakplayer.js', 'public/js/entities/SpeakPlayer.Entities.js',
            'public/js/modules/SpeakPlayer.Loader.js',
            'public/js/modules/SpeakPlayer.AudioModule.js',
            'public/js/modules/SpeakPlayer.FeaturedSound.js',
            'public/js/modules/SpeakPlayer.FilterModule.js',
            'public/js/modules/SpeakPlayer.Library.js',
            'public/js/modules/SpeakPlayer.Playlist.js',
            'public/js/modules/SpeakPlayer.Player.js',
            'public/js/modules/SpeakPlayer.RouterModule.js',
            'public/js/modules/SpeakPlayer.Search.js',
            'public/js/modules/SpeakPlayer.SoundPost.js',


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
        files: ['public/js/app/Speakplayer.js', 'public/js/entities/SpeakPlayer.Entities.js', 'public/js/modules/*.js' ],
        tasks: 'compileJS',
        options: {
          spawn: false
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