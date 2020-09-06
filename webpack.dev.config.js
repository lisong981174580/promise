const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new htmlWebpackPlugin({
      template: path.join(__dirname, 'index.html'),
      filename: 'index.html',
    })
  ],
  devServer: {
    port: 9000,
    // 自动打开浏览器
    open: true,
    contentBase: path.join(__dirname, 'dist'),
  },
}
