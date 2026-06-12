module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'react-native-unistyles/plugin',
        {
          root: 'app',
          // UI components live outside `app/`; process any file that imports Unistyles.
          autoProcessImports: ['react-native-unistyles'],
        },
      ],
    ],
  };
};
