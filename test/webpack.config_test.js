const path = require('path');

module.exports = [{
  mode: 'development',
  target: 'web',
  entry: './test_index.js',
  output: {
    filename: "main.js",
  },
  watchOptions: {
    ignored: 'node_modules/**',
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.glsl$/,
        loader: 'webpack-glsl-loader'
      }
    ],
  }
}];