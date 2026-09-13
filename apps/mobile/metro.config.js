const { getDefaultConfig } = require('expo/metro-config');

/** Expo erkennt npm Workspaces selbst und löst @family-companion/shared auf. */
const config = getDefaultConfig(__dirname);

module.exports = config;
