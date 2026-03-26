/**
 * @fileOverview Firebase configuration module.
 *
 * This module exports the Firebase configuration object for the web app.
 * It reads the configuration from multiple sources to ensure compatibility
 * with local development (.env) and Firebase App Hosting environments.
 */

function getFirebaseConfig() {
  let config: any = {};

  // 1. Try system-provided config (most reliable in App Hosting)
  // We check for both NEXT_PUBLIC_ and non-prefixed versions
  const systemConfigStr = 
    process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG || 
    process.env.FIREBASE_WEBAPP_CONFIG;

  if (systemConfigStr) {
    try {
      config = JSON.parse(systemConfigStr);
    } catch (e) {
      console.error("Failed to parse FIREBASE_WEBAPP_CONFIG", e);
    }
  }

  // 2. Fallback to individual variables if system config is missing or incomplete
  // Note: We handle the detected leading space typo from the environment logs (' apiKey')
  const apiKey = 
    config.apiKey || 
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
    process.env[' apiKey'] || 
    process.env.apiKey ||
    '';

  const appId = config.appId || process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.appId || '';
  const authDomain = config.authDomain || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.authDomain || '';
  const projectId = config.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.projectId || '';
  const storageBucket = config.storageBucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.storageBucket || '';
  const messagingSenderId = config.messagingSenderId || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.messagingSenderId || '';

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId: config.measurementId || '',
  };
}

export const firebaseConfig = getFirebaseConfig();
