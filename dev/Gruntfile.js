module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
      shell: {
          renderHBS: {
              command: 'handlebars public/hb/*.* -f ../trunk/public/js/renderedTemplates.js'
          }
      },
    sass: {
      options: {
        includePaths: ['public/scss']
      },
      dist: {
        options: {
          outputStyle: 'expanded',
          sourceMap: true
        },
        files: {
          '../trunk/public/css/app.css': 'public/scss/app.scss'
        }
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
        'public/js/*.js'
        ],

        dest: '../trunk/public/js/speakplayer-public.js',
      },

    },
    autoprefixer: {
      dist: {
        files: {
          'css/app.css': 'css/app.css'
        }
      }
    },
    watch: {
      grunt: { files: ['Gruntfile.js'] },
      sass: {
        files: 'public/scss/*.scss',
        tasks: ['sass']

      },
    shell: {
        files : 'public/hb/*.*',
        tasks: ['shell']
    },
      livereload: { 
        files: ['*.html', 'js/**/*.{js,json}', 'css/*.css','img/**/*.{png,jpg,jpeg,gif,webp,svg}'], 
        options: { 
          livereload: true 
        } 
      },
      concat: {
        files: ['public/js/*.js'],
        tasks: 'compileJS',
        options: {
          spawn: false,
        }
      }
    }
  });

grunt.loadNpmTasks('grunt-sass');
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