import { withNativeFederation } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'tracker',

  exposes: {
    './TrackerMount': './src/bootstrap.ts',
  },

  
  shared: {},

  skip: [
    'zone.js',
    'sharedApp/authService',
  ]
});