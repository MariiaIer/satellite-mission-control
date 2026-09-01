const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

const mfConfig = withModuleFederationPlugin({
  name: 'angularTracker',
  filename: 'remoteEntry.js',
  exposes: {
    './TrackerMount': './src/bootstrap.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto' }),
  },
});

module.exports = {
  ...mfConfig,
  output: {
    ...mfConfig.output,
    publicPath: 'http://localhost:5004/',
    scriptType: 'text/javascript',
    library: {
      type: 'var',
      name: 'angularTracker',
    },
  },
  devServer: {
    ...mfConfig.devServer,
    port: 5004,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};