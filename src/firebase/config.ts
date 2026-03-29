
// Helper to get the API Key safely
function getApiKey() {
  // 1. Try the system-provided config string (injected by App Hosting)
  if (typeof process !== 'undefined' && process.env.FIREBASE_WEBAPP_CONFIG) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
      if (parsed.apiKey) return parsed.apiKey;
    } catch (e) {
      // Ignore parse errors
    }
  }

  // 2. Try the environment variables (including handling the common leading space typo)
  return (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env[' NEXT_PUBLIC_FIREBASE_API_KEY'] || // Handles the leading space typo detected in logs
    "AIzaSyBUt1b8kP42TqOh7HCliL6bxywI3A7gvk4" // Final fallback
  );
}

export const firebaseConfig = {
  apiKey: getApiKey(),
  authDomain: "studio-7062771887-1161b.firebaseapp.com",
  projectId: "studio-7062771887-1161b",
  storageBucket: "studio-7062771887-1161b.appspot.com",
  messagingSenderId: "604389852678",
  appId: "1:604389852678:web:40cc472b5131ef066ba587",
  measurementId: "G-7F4V920W2P",
};
