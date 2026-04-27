// firebase.js

import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDvILKWPJrGG0koGy49O6nUBkO1WkJirSo",
  authDomain: "classpulse-3abb3.firebaseapp.com",
  projectId: "classpulse-3abb3",
  storageBucket: "classpulse-3abb3.firebasestorage.app",
  messagingSenderId: "428323376889",
  appId: "1:428323376889:web:4215ef789a499264955c28",
  measurementId: "G-HN70KXV3JX"
};

// ✅ 1. Initialize app FIRST
const app = initializeApp(firebaseConfig);

// ✅ 2. THEN create db + auth

export const auth = getAuth(app);