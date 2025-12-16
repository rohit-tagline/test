import { getApp, getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCM4OqCtyCx9BxsGHwXeOE6xEXNXqVd6ww',
  authDomain: 'test-1c3ad.firebaseapp.com',
  databaseURL: 'https://test-1c3ad-default-rtdb.firebaseio.com',
  projectId: 'test-1c3ad',
  storageBucket: 'test-1c3ad.firebasestorage.app',
  messagingSenderId: '776795403659',
  appId: '1:776795403659:web:35cd47b0a0c1eb6699ab8e',
  measurementId: 'G-SERPJC8VB3',
};

const getFirebaseApp = () => {
  const apps = getApps();
  return apps.length ? getApp() : initializeApp(FIREBASE_CONFIG);
};

export const getFirebaseDb = () => {
  const app = getFirebaseApp();
  return getDatabase(app);
};

export const getFirebaseFirestore = () => {
  const app = getFirebaseApp();
  return getFirestore(app);
};
