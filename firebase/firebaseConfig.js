/**
 * firebase/firebaseConfig.js
 * Safe initialisation — never throws "App already exists" on hot reload.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_AUTH_DOMAIN",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

// Only initialise once — safe on Expo hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// initializeAuth with AsyncStorage persistence so the session survives
// app restarts and the user object is ready immediately on next launch.
// Falls back gracefully if already initialised.
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Auth already initialised on a hot-reload — just grab the instance
  const { getAuth } = require("firebase/auth");
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;