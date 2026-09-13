import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let _authInstance: Auth | null = null;
export const getAuthInstance = (): Auth => {
  if (!_authInstance) {
    try {
      _authInstance = getAuth(app);
    } catch (err) {
      console.warn('getAuth(app) encountered error, trying getAuth():', err);
      try {
        _authInstance = getAuth();
      } catch (innerErr) {
        console.warn('Fallback getAuth() failed:', innerErr);
        throw err;
      }
    }
  }
  return _authInstance;
};

// Safe proxy to prevent "Component auth has not been registered yet" during module initialization
export const auth: Auth = new Proxy({} as Auth, {
  get(target, prop, receiver) {
    const instance = getAuthInstance();
    const val = Reflect.get(instance as unknown as object, prop, receiver);
    if (typeof val === 'function') {
      return (val as (...args: unknown[]) => unknown).bind(instance);
    }
    return val;
  },
  has(target, prop) {
    try {
      const instance = getAuthInstance();
      return Reflect.has(instance as unknown as object, prop);
    } catch {
      return false;
    }
  },
  getPrototypeOf() {
    try {
      const instance = getAuthInstance();
      return Reflect.getPrototypeOf(instance as unknown as object);
    } catch {
      return Object.prototype;
    }
  },
});

let _dbInstance: Firestore | null = null;
export const getDbInstance = (): Firestore => {
  if (!_dbInstance) {
    _dbInstance = getFirestore(
      app,
      firebaseConfig.firestoreDatabaseId || '(default)'
    );
  }
  return _dbInstance;
};

export const db: Firestore = new Proxy({} as Firestore, {
  get(target, prop, receiver) {
    const instance = getDbInstance();
    const val = Reflect.get(instance as unknown as object, prop, receiver);
    if (typeof val === 'function') {
      return (val as (...args: unknown[]) => unknown).bind(instance);
    }
    return val;
  },
  has(target, prop) {
    try {
      const instance = getDbInstance();
      return Reflect.has(instance as unknown as object, prop);
    } catch {
      return false;
    }
  },
  getPrototypeOf() {
    try {
      const instance = getDbInstance();
      return Reflect.getPrototypeOf(instance as unknown as object);
    } catch {
      return Object.prototype;
    }
  },
});

export default app;
