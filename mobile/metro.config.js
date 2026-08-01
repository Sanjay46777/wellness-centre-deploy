const { getDefaultConfig } = require('expo/metro-config');
const { withDevkit } = require('miaoda-expo-devkit/metro');

const config = getDefaultConfig(__dirname);

// Disable Watchman in containerized environments to avoid inotify limits.
config.resolver = {
  ...config.resolver,
  useWatchman: false,
};

module.exports = withDevkit(config);
