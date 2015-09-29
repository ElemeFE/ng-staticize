var plugins = [];

if (process.env.COMPRESS) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({})
  );
}

module.exports = {
  entry: './src/index.js',
  output: {
    path: './dist',
    filename: 'ng-staticize.js'
  },
  module: {
    preLoaders: [
      { test: /\.js$/, exclude: /node_modules|bower_components/, loader: 'eslint-loader' }
    ]
  },
  plugins: plugins
};