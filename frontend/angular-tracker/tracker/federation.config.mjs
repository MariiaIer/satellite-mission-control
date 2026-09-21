import { withNativeFederation } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'tracker',

  exposes: {
    './TrackerMount': './src/bootstrap.ts',
  },

  // Отключаем shareAll, чтобы Native Federation не резала библиотеки на мелкие спецификаторы (tslib, cdk, primitives)
  shared: {},

  skip: [
    'zone.js',
    'sharedApp/authService',
  ]
});