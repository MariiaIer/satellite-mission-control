const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/main.jsx',
  mode: 'development',
  devServer: {
    port: 5001,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    publicPath: 'http://localhost:5001/',
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
      name: 'authApp',
      filename: 'remoteEntry.js',
      exposes: {
        './LoginForm': './src/components/LoginForm.jsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '19.2.8' },
        'react-dom': { singleton: true, requiredVersion: '19.2.8' },
        'react-router-dom': { singleton: true, requiredVersion: '7.18.3' },
      },
      remotes: {
        sharedApp: 'sharedApp@http://localhost:5003/remoteEntry.js',
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