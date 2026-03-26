/**
 * @fileOverview Firebase configuration module.
 *
 * This module exports the Firebase configuration object for the web app.
 * It reads the configuration from multiple sources to ensure compatibility
 * with local development (.env) and Firebase App Hosting environments.
 */

function getFirebaseConfig() {
  // Source 1: Standard Next.js client-side environment variables
  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // Source 2: System-provided FIREBASE_WEBAPP_CONFIG (Automatic in App Hosting)
  const systemConfigStr = process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG || process.env.FIREBASE_WEBAPP_CONFIG;
  let systemConfig: any = {};
  if (systemConfigStr) {
    try {
      systemConfig = JSON.parse(systemConfigStr);
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Source 3: Fallback for the space typo detected in environment logs (' apiKey')
  // Also check for non-prefixed versions that might be available during build
  const fallbackApiKey = process.env[' apiKey'] || process.env['apiKey'] || process.env['NEXT_PUBLIC_apiKey'];

  return {
    apiKey: envConfig.apiKey || systemConfig.apiKey || fallbackApiKey || '',
    authDomain: envConfig.authDomain || systemConfig.authDomain || '',
    projectId: envConfig.projectId || systemConfig.projectId || '',
    storageBucket: envConfig.storageBucket || systemConfig.storageBucket || '',
    messagingSenderId: envConfig.messagingSenderId || systemConfig.messagingSenderId || '',
    appId: envConfig.appId || systemConfig.appId || '',
    measurementId: envConfig.measurementId || systemConfig.measurementId || '',
  };
}

export const firebaseConfig = getFirebaseConfig();
