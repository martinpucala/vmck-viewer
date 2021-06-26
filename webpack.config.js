const path = require('path');

module.exports = {
  entry: {
    main: path.resolve(__dirname, 'src/index.jsx'),
  },

  module :{
    rules: [{
      test: /\.jsx?$/,
      loader: "babel-loader",
      exclude: [/node_modules/, /dist/],
    }]
  },

  resolve: {
    extensions: ['*', '.js', '.jsx']
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.bundle.js',
  },

  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
  }
};



// // const path = require('path');
 
// // module.exports = {
// //   entry: path.resolve(__dirname, './src/index.js'),
// //   module: {
// //     rules: [
//       {
//         test: /\.(js|jsx)$/,
//         exclude: /node_modules/,
//         use: ['babel-loader'],
//       },
//     ],
//   },
//   resolve: {
//     extensions: ['*', '.js', '.jsx'],
//   },
//   output: {
//     path: path.resolve(__dirname, './dist'),
//     filename: 'bundle.js',
//   },
//   devServer: {
//     contentBase: path.resolve(__dirname, './dist'),
//   },
