import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Suprime mensagens e avisos internos de timeout e reconexão transitória do SDK do Firestore
try {
  setLogLevel('silent');
} catch {
  // Silencioso se não disponível
}

if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;
  const isFirestoreBackendLog = (msg: unknown) =>
    typeof msg === 'string' &&
    (msg.includes('Could not reach Cloud Firestore backend') ||
      msg.includes('Backend didn\'t respond within 10 seconds') ||
      msg.includes('@firebase/firestore'));

  console.warn = (...args: unknown[]) => {
    if (args[0] && isFirestoreBackendLog(args[0])) return;
    originalWarn.apply(console, args as [unknown, ...unknown[]]);
  };
  console.error = (...args: unknown[]) => {
    if (args[0] && isFirestoreBackendLog(args[0])) return;
    originalError.apply(console, args as [unknown, ...unknown[]]);
  };
}

export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);

const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      // Força Long Polling imediatamente para evitar o timeout de 10s de WebSockets bloqueados no iframe sandbox
      experimentalForceLongPolling: true,
    },
    databaseId
  );
} catch {
  firestoreDb = getFirestore(app, databaseId);
}

export const db: Firestore = firestoreDb;

export const getAuthInstance = (): Auth => auth;
export const getDbInstance = (): Firestore => db;

/**
 * Executes a Firestore async operation bounded by a timeout.
 * If the connection is unavailable (e.g. offline, proxy blocked, or slow network),
 * it returns the fallback value without throwing or freezing the app.
 */
export async function safeFirestoreCall<T>(
  operation: () => Promise<T>,
  fallback: T = null as unknown as T,
  timeoutMs: number = 2500
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeoutPromise = new Promise<T>((resolve) => {
      timer = setTimeout(() => resolve(fallback), timeoutMs);
    });
    const opPromise = operation().catch((_err) => {
      // Gracefully handle unavailable / network issues
      return fallback;
    });

    const result = await Promise.race([opPromise, timeoutPromise]);
    return result;
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export default app;
