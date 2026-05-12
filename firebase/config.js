import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDkGlO8G0seOjZ6yg_YS4I25ff7ZF5tXOo",
  authDomain: "quizaiapp-6bfd1.firebaseapp.com",
  projectId: "quizaiapp-6bfd1",
  storageBucket: "quizaiapp-6bfd1.firebasestorage.app",
  messagingSenderId: "500707922481",
  appId: "1:500707922481:web:b0db072b4f1da68518bb10",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app)