const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const pkg = require('../package.json');
const TerserPlugin = require('terser-webpack-plugin');

const date = (new Date()).toISOString().replace(/:\d+\.\d+Z$/, 'Z');
const banner = `
jQuery Table of Contents ${pkg.version}
Copyright 2021 - Greg Franko, Julien Colot
jquery-tocit may be freely distributed under the MIT license.
Date: ${date}
`;
const minBanner = banner;


module.exports = {
  entry: {
    'jquery-tocit': './src/js/jquery-tocit.js',
  },
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        test: /\.min\.js$/g,
        extractComments: false,
        terserOptions: {
          sourceMap: true,
          ecma: 8,
          compress: {
            warnings: false,
          },
        },
      }),
    ],
  },
  output: {
    publicPath: '/',
    path: path.join(__dirname, '../dist'),
    libraryTarget: 'umd',
    filename: 'jquery-tocit.js'
  },
  externals: {
    jquery: {
      root: 'jQuery',
      commonjs2: 'jquery',
      commonjs: 'jquery',
      amd: 'jquery',
    },
    jqueryui: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'string-replace-loader',
            options: {
              search: '@@VERSION@@',
              replace: pkg.version,
            },
          }, {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  devtool: false,
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.BannerPlugin({
      banner: ({filename}) => {
        return filename.includes('min') ? minBanner : banner;
      },
    }),
    new webpack.SourceMapDevToolPlugin({
      test: /(jquery-tocit)(\.min)?\.js$/g,
      filename: '[name].js.map',
    }),
  ],
};
