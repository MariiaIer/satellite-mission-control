const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

module.exports = {
  entry: './src/main.jsx',
  mode: 'development',
  output: {
    publicPath: 'http://localhost:5003/',
    scriptType: 'text/javascript',
  },
  devServer: {
    port: 5003,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    allowedHosts: 'all',
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        resolve: {
          fullySpecified: false, // Отключает жесткие требования к расширениям файла .js
        },
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
      name: 'sharedApp',
      filename: 'remoteEntry.js',
      exposes: {
        './MainLayout': './src/components/MainLayout.jsx',
        './Header': './src/components/Header.jsx',
        './Sidebar': './src/components/Sidebar.jsx',
        './jwtUtils': './src/utils/jwt.js',
        './authService': './utils/authService.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: deps['react-dom'],
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: deps['react-router-dom'],
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
};