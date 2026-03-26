/**
 * @fileOverview Firebase configuration module.
 * 
 * This module exports the Firebase configuration object. It attempts to load
 * configuration from environment variables, including the system-provided
 * FIREBASE_WEBAPP_CONFIG JSON string available in Firebase App Hosting.
 */

function getFirebaseConfig() {
  // In Firebase App Hosting, the FIREBASE_WEBAPP_CONFIG environment variable
  // contains the full Firebase configuration object as a JSON string.
  let webAppConfig: any = {};
  try {
    // Attempt to load from the system-provided JSON string (available at build and runtime)
    const configString = process.env.FIREBASE_WEBAPP_CONFIG || process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG;
    if (configString) {
      webAppConfig = JSON.parse(configString);
    }
  } catch (e) {
    console.error("Firebase Config: Failed to parse FIREBASE_WEBAPP_CONFIG string.", e);
  }

  // Next.js standard: Only variables prefixed with NEXT_PUBLIC_ are available on the client.
  // We provide fallbacks for manually set variables and system variables.
  return {
    apiKey: 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
      webAppConfig.apiKey || 
      process.env.apiKey || 
      process.env[' apiKey'] || // Fallback for detected space typo in console
      '',
    authDomain: 
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 
      webAppConfig.authDomain ||
      '',
    projectId: 
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
      webAppConfig.projectId ||
      '',
    storageBucket: 
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
      webAppConfig.storageBucket ||
      '',
    messagingSenderId: 
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 
      webAppConfig.messagingSenderId ||
      '',
    appId: 
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 
      webAppConfig.appId ||
      '',
    measurementId: 
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 
      webAppConfig.measurementId ||
      '',
  };
}

export const firebaseConfig = getFirebaseConfig();
