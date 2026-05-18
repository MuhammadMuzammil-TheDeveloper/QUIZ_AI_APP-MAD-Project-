// firebase/firebaseConfig.js

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDkGlO8G0seOjZ6yg_YS4I25ff7ZF5tXOo",
  authDomain: "quizaiapp-6bfd1.firebaseapp.com",
  projectId: "quizaiapp-6bfd1",
  storageBucket: "quizaiapp-6bfd1.firebasestorage.app",
  messagingSenderId: "500707922481",
  appId: "1:500707922481:web:b0db072b4f1da68518bb10",
};

// SAFE INITIALIZATION
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
export default app;