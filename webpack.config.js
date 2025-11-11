// webpack.config.js
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

/** @type {import('webpack').Configuration} */
export default {
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
    }),
  ],
  performance: { hints: false },
};
