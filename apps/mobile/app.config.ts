import { existsSync } from 'node:fs';
import path from 'node:path';
import type { ExpoConfig } from 'expo/config';

/** Lokal: apps/mobile/google-services.json. EAS: File-Env GOOGLE_SERVICES_JSON (Pfad auf dem Builder). */
const googleServicesFromEnv = process.env.GOOGLE_SERVICES_JSON;
const googleServicesLocal = path.join(__dirname, 'google-services.json');
const googleServicesFile = googleServicesFromEnv ?? googleServicesLocal;
const hasGoogleServices =
  Boolean(googleServicesFromEnv) || existsSync(googleServicesLocal);

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
    ...(hasGoogleServices
      ? {
          googleServicesFile: googleServicesFromEnv ?? './google-services.json',
        }
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
    '@react-native-community/datetimepicker',
  ],
  experiments: {
    typedRoutes: false,
  },
  extra: {
    eas: {
      projectId: '84cdff5d-6899-4e38-b379-93b86ee993a6',
    },
  },
};

export default config;
