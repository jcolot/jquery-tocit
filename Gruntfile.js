const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const pkg = require('./package.json');
const TerserPlugin = require('terser-webpack-plugin');

const date = (new Date()).toISOString().replace(/:\d+\.\d+Z$/, 'Z');

module.exports = function(grunt) {

    grunt.initConfig({
        pkg    : grunt.file.readJSON('package.json'),
        eslint : {
            options : {
                maxWarnings : 100,
            },
            dev : {
                src : [
                    'src/*.js',
                ]
            }
        },
        'string-replace': {
            dist: {
                files: {
                    'demos/': ['src/html/*.html'],
                },
                options: {
                    replacements: [{
                        pattern: /___VERSION___/g,
                        replacement: pkg.version
                        }
                    ]
                }
            }
        },
        webpack: {
            options: {},
            prod: require('./config/webpack.config.production.js')  
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-string-replace');

    grunt.registerTask('test', ['eslint']);
    grunt.registerTask('build', ['string-replace', 'webpack']);
    grunt.registerTask('default', ['test', 'build']);

};
