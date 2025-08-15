module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@store': './src/store',
          '@services': './src/services',
          '@types': './src/types',
          '@config': './src/config',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};
