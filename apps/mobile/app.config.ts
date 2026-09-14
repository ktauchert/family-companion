import { existsSync } from 'node:fs';
import path from 'node:path';
import type { ExpoConfig } from 'expo/config';

const googleServicesFile = path.join(__dirname, 'google-services.json');

const config: ExpoConfig = {
  name: 'Family Companion',
  slug: 'family-companion',
  version: '0.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'familycompanion',
  userInterfaceStyle: 'automatic',
  android: {
    package: 'com.familycompanion.app',
    ...(existsSync(googleServicesFile)
      ? { googleServicesFile: './google-services.json' }
      : {}),
    adaptiveIcon: {
      backgroundColor: '#F6F3EE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-web-browser',
    '@react-native-google-signin/google-signin',
  ],
  experiments: {
    typedRoutes: false,
  },
};

export default config;
