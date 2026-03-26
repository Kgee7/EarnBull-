/**
 * @fileOverview Firebase configuration module.
 *
 * This module exports the Firebase configuration object for the web app.
 * It is designed to be resilient in production environments (like Firebase App Hosting)
 * by checking multiple environment variable patterns and the system-provided
 * FIREBASE_WEBAPP_CONFIG object.
 */

function getFirebaseConfig() {
  let config: any = {};

  // 1. Try to parse the system-provided configuration string.
  // We check both prefixed and non-prefixed versions.
  const systemConfigStr = 
    process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG || 
    process.env.FIREBASE_WEBAPP_CONFIG;

  if (systemConfigStr) {
    try {
      config = JSON.parse(systemConfigStr);
    } catch (e) {
      // Silently fail during build if not parseable
    }
  }

  // 2. Extract values with fallbacks.
  // We handle the detected leading space typo from environment logs (' apiKey')
  // and prioritize NEXT_PUBLIC_ prefixes for client-side availability.
  const apiKey = 
    config.apiKey || 
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
    process.env['NEXT_PUBLIC_ apiKey'] ||
    process.env[' apiKey'] || 
    process.env.apiKey ||
    '';

  const authDomain = 
    config.authDomain || 
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 
    process.env.authDomain || 
    '';

  const projectId = 
    config.projectId || 
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
    process.env.projectId || 
    '';

  const storageBucket = 
    config.storageBucket || 
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
    process.env.storageBucket || 
    '';

  const messagingSenderId = 
    config.messagingSenderId || 
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 
    process.env.messagingSenderId || 
    '';

  const appId = 
    config.appId || 
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 
    process.env.appId || 
    '';

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
