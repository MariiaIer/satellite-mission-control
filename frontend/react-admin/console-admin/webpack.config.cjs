const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/main.jsx',
  mode: 'development',
  devtool: 'source-map',
  output: {
    publicPath: 'http://localhost:5002/',
    scriptType: 'text/javascript',
  },
  devServer: {
    port: 5002,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    allowedHosts: 'all',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'adminApp',
      filename: 'remoteEntry.js',
      remotes: {
        sharedApp: 'sharedApp@http://localhost:5003/remoteEntry.js',
      },
      exposes: {
        './App': './src/App.jsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '19.2.8' },
        'react-dom': { singleton: true, requiredVersion: '19.2.8' },
        'react-router-dom': { singleton: true, requiredVersion: '7.18.3' },
        'react/jsx-runtime': { singleton: true, requiredVersion: '19.2.8' },
        'react/jsx-dev-runtime': { singleton: true, requiredVersion: '19.2.8' },
      },
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
  resolve: {
    extensions: ['.jsx', '.js'],
  },
};