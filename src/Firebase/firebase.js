// firebase.js

import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAriZPBlr8la89Cl0KqBMLgw_flNUxhZps",
  authDomain: "crve-801a7.firebaseapp.com",
  projectId: "crve-801a7",
  storageBucket: "crve-801a7.appspot.com",
  messagingSenderId: "353750817401",
  appId: "1:353750817401:web:cc45e9d50358d6819212a8"
};

// ✅ Only initialize once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ Initialize auth with persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  // initializeAuth throws if called twice, fall back to getAuth
  auth = getAuth(app);
}

// ✅ Firestore instance
const db = getFirestore(app);

export { auth, db };
