/**
 * @fileOverview Firebase configuration module.
 *
 * This module exports the Firebase configuration object for the web app.
 * It reads the configuration from multiple sources to ensure compatibility
 * with local development (.env) and Firebase App Hosting environments.
 */

function getFirebaseConfig() {
  let config: any = {};

  // Source 1: System-provided FIREBASE_WEBAPP_CONFIG (Automatic in App Hosting)
  const systemConfigStr = process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG || process.env.FIREBASE_WEBAPP_CONFIG;
  if (systemConfigStr) {
    try {
      config = JSON.parse(systemConfigStr);
    } catch (e) {
      console.error("Failed to parse FIREBASE_WEBAPP_CONFIG", e);
    }
  }

  // Source 2: Standard Next.js client-side environment variables (for local dev)
  if (!Object.keys(config).length) {
    config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
  }

  // Log the config for debugging purposes
  console.log("Firebase Config:", config);

  return {
    apiKey: config.apiKey || '',
    authDomain: config.authDomain || '',
    projectId: config.projectId || '',
    storageBucket: config.storageBucket || '',
    messagingSenderId: config.messagingSenderId || '',
    appId: config.appId || '',
    measurementId: config.measurementId || '',
  };
}

export const firebaseConfig = getFirebaseConfig();
