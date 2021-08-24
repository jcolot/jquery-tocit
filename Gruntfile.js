module.exports = function(grunt) {

    grunt.initConfig({
        pkg    : grunt.file.readJSON('package.json'),
        eslint : {
            options : {
                maxWarnings : 100
            },

            // We have to explicitly declare "src" property otherwise "newer"
            // task wouldn't work properly :/
            dist : {
                src : ['dist/jquery.js', 'dist/jquery.min.js']
            },
            dev : {
                src : [
                    'src/*.js',
                ]
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['@babel/preset-env']
            },
            dist: {
                files: {
                    './dist/jquery-tocit.es5.js' : ['./src/jquery-tocit.js']
                }
            }
        },
        uglify : {
            target : {
                files : {
                    './dist/jquery-tocit.min.js' : ['./dist/jquery-tocit.es5.js']
                }
            },
            options : {
                banner : '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> \n' +
        '<%= pkg.homepage ? "* " + pkg.homepage : "" %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.map(pkg.licenses, "type").join(", ") %>*/\n'
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('test', ['eslint']);
    grunt.registerTask('build', ['babel', 'uglify']);
    grunt.registerTask('default', ['test', 'build']);

};
