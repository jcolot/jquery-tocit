const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const pkg = require('./package.json');
const TerserPlugin = require('terser-webpack-plugin');

const date = (new Date()).toISOString().replace(/:\d+\.\d+Z$/, 'Z');
const banner = `
jQuery Table of Contents ${pkg.version}
Copyright 2021 - Greg Franko, Julien Colot
jquery-tocit may be freely distributed under the MIT license.
Date: ${date}
`;

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
        webpack: {
            options: {},
            prod: require('./config/webpack.config.production.js')  
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-webpack');

    grunt.registerTask('test', ['eslint']);
    grunt.registerTask('uglify', ['babel', 'uglify'])
    grunt.registerTask('build', ['webpack']);
    grunt.registerTask('default', ['test', 'build']);

};
