module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': '.',
          '@app': './app',
          '@components': './components',
          '@features': './features',
          '@theme': './theme',
          '@hooks': './hooks',
          '@services': './services',
          '@utils': './utils',
          '@types': './types',
          '@constants': './constants',
          '@assets': './assets',
        },
      },
    ],
    '@babel/plugin-transform-export-namespace-from',
    'react-native-reanimated/plugin',
  ],
};
