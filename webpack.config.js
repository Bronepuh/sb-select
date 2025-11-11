// webpack.config.js  (CommonJS версия)
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: path.resolve('client/src/index.tsx'),
  output: {
    path: path.resolve('dist'),
    filename: 'assets/[name].[contenthash].js',
    chunkFilename: 'assets/[name].[contenthash].js',
    clean: true,
    publicPath: '/sbertest/',
  },
  resolve: { extensions: ['.ts', '.tsx', '.js'] },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: { loader: 'ts-loader', options: { transpileOnly: true } },
      },
      {
        test: /\.module\.css$/i,
        use: [
          { loader: 'style-loader', options: { esModule: false } },
          {
            loader: 'css-loader',
            options: {
              esModule: false,
              modules: { localIdentName: '[local]_[hash:base64:5]' },
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        exclude: /\.module\.css$/i,
        use: [
          { loader: 'style-loader', options: { esModule: false } },
          { loader: 'css-loader', options: { esModule: false } },
        ],
      },
    ],
  },

  devServer: {
    port: 3005,
    static: { directory: path.resolve('client/public') },
    devMiddleware: { publicPath: '/sbertest/' },
    historyApiFallback: { index: '/sbertest/index.html', disableDotRule: true },
    proxy: [
      {
        context: ['/options/for/select', '/selected/option'],
        target: 'http://127.0.0.1:5055',
      },
    ],
    client: { overlay: true },
    open: ['/sbertest/'],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve('client/public/index.html'),
      publicPath: '/sbertest/',
    }),
    new webpack.DefinePlugin({
      'process.env.API_BASE': JSON.stringify(
        process.env.NODE_ENV === 'production' ? '/sbertest-api' : ''
      ),
    }),
  ],

  performance: { hints: false },
};
