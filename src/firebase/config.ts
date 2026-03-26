/**
 * @fileOverview Firebase configuration module.
 *
 * This module exports the Firebase configuration object for the web app.
 * It hardcodes non-sensitive project identifiers for stability and uses
 * robust logic to retrieve the API Key from environment variables.
 */

function getFirebaseConfig() {
  // 1. Try to parse the system-provided configuration string.
  const systemConfigStr = 
    process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG || 
    process.env.FIREBASE_WEBAPP_CONFIG;

  let systemConfig: any = {};
  if (systemConfigStr) {
    try {
      systemConfig = JSON.parse(systemConfigStr);
    } catch (e) {
      // Silently fail if not parseable
    }
  }

  // 2. Extract values.
  // We handle the detected leading space typo from environment logs (' apiKey')
  // and prioritize NEXT_PUBLIC_ prefixes for client-side availability.
  const apiKey = 
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
    process.env['NEXT_PUBLIC_ apiKey'] || // Support the space typo found in logs
    process.env[' apiKey'] || 
    process.env.apiKey ||
    systemConfig.apiKey || 
    '';

  return {
    apiKey,
    authDomain: systemConfig.authDomain || "studio-7062771887-1161b.firebaseapp.com",
    projectId: systemConfig.projectId || "studio-7062771887-1161b",
    storageBucket: systemConfig.storageBucket || "studio-7062771887-1161b.appspot.com",
    messagingSenderId: systemConfig.messagingSenderId || "604389852678",
    appId: systemConfig.appId || "1:604389852678:web:40cc472b5131ef066ba587",
    measurementId: systemConfig.measurementId || "G-7F4V920W2P",
  };
}

export const firebaseConfig = getFirebaseConfig();
