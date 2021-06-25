const path = require('path');

module.exports = {
  entry: {
    main: path.resolve(__dirname, 'src/main.js'),
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.bundle.js',
  },

  devServer: {
    contentBase: './dist',
  }
};
