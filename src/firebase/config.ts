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
    const configString = process.env.FIREBASE_WEBAPP_CONFIG || process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG;
    if (configString) {
      webAppConfig = JSON.parse(configString);
    }
  } catch (e) {
    console.error("Firebase Config: Failed to parse FIREBASE_WEBAPP_CONFIG string.", e);
  }

  return {
    apiKey: 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
      webAppConfig.apiKey || 
      process.env.apiKey || 
      process.env[' apiKey'], // Support the typo detected in the logs (leading space)
    authDomain: 
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 
      webAppConfig.authDomain ||
      process.env.authDomain ||
      process.env[' authDomain'],
    projectId: 
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
      webAppConfig.projectId ||
      process.env.projectId ||
      process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: 
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
      webAppConfig.storageBucket,
    messagingSenderId: 
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 
      webAppConfig.messagingSenderId,
    appId: 
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 
      webAppConfig.appId,
    measurementId: 
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 
      webAppConfig.measurementId,
  };
}

export const firebaseConfig = getFirebaseConfig();
