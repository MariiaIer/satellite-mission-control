const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/main.jsx',
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    port: 5000,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    publicPath: 'http://localhost:5000/',
    scriptType: 'text/javascript',
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
      name: 'shellHost',
      remotes: {
        authApp: 'authApp@http://localhost:5001/remoteEntry.js',
        adminApp: 'adminApp@http://localhost:5002/remoteEntry.js',
        sharedApp: 'sharedApp@http://localhost:5003/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: '19.2.8' },
        'react-dom': { singleton: true, eager: true, requiredVersion: '19.2.8' },
        'react-router-dom': { singleton: true, requiredVersion: '7.18.3' },
        'react/jsx-runtime': { singleton: true, eager: true, requiredVersion: '19.2.8' },
        'react/jsx-dev-runtime': { singleton: true, eager: true, requiredVersion: '19.2.8' },
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