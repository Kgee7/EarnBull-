/**
 * @fileOverview Firebase configuration module.
 * 
 * This module exports the Firebase configuration object. It attempts to load
 * configuration from multiple sources to ensure compatibility with local
 * development and Firebase App Hosting environments.
 */

function getFirebaseConfig() {
  // In Firebase App Hosting, the FIREBASE_WEBAPP_CONFIG environment variable
  // contains the full Firebase configuration object as a JSON string.
  let webAppConfig: any = {};
  
  // 1. Try to parse from the system-provided JSON string
  const configString = process.env.FIREBASE_WEBAPP_CONFIG || process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG;
  if (configString) {
    try {
      webAppConfig = JSON.parse(configString);
    } catch (e) {
      // Ignore parse errors during build-time checks
    }
  }

  // 2. Build the final config object with fallbacks.
  // Note: NEXT_PUBLIC_ variables are baked into the client JS at build time.
  return {
    apiKey: 
      webAppConfig.apiKey || 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
      process.env.apiKey || 
      process.env[' apiKey'] || // Fallback for typo detected in user env logs
      '',
    authDomain: 
      webAppConfig.authDomain || 
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 
      '',
    projectId: 
      webAppConfig.projectId || 
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
      '',
    storageBucket: 
      webAppConfig.storageBucket || 
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
      '',
    messagingSenderId: 
      webAppConfig.messagingSenderId || 
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 
      '',
    appId: 
      webAppConfig.appId || 
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 
      '',
    measurementId: 
      webAppConfig.measurementId || 
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 
      '',
  };
}

export const firebaseConfig = getFirebaseConfig();
