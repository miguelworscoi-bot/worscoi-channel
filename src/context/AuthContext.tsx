'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, selectedRole?: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to determine default role if not explicitly defined
  const resolveRole = (email?: string | null, savedRole?: string): UserRole => {
    if (savedRole === 'admin' || savedRole === 'user') {
      return savedRole;
    }
    // Default admin if email contains admin or matches project user email
    if (email && (email.toLowerCase().includes('admin') || email.toLowerCase() === 'confirmacaomatriculaquessua@gmail.com')) {
      return 'admin';
    }
    return 'user';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            const role = resolveRole(currentUser.email, data.role);
            const profile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: data.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuário',
              photoURL: currentUser.photoURL || '',
              role,
              createdAt: data.createdAt || new Date().toISOString(),
            };
            setUserProfile(profile);
          } else {
            const initialRole = resolveRole(currentUser.email);
            const profileData: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuário',
              photoURL: currentUser.photoURL || '',
              role: initialRole,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, profileData, { merge: true });
            setUserProfile(profileData);
          }
        } catch {
          const initialRole = resolveRole(currentUser.email);
          setUserProfile({
            id: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuário',
            role: initialRole,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, selectedRole: UserRole = 'user') => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user && name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    const profileData: UserProfile = {
      id: cred.user.uid,
      email: cred.user.email || '',
      displayName: name.trim() || cred.user.email?.split('@')[0] || 'Usuário',
      role: selectedRole,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'users', cred.user.uid), profileData, { merge: true });
    } catch {
      // Silently fall back if rules prevent
    }
    setUserProfile(profileData);
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user || !userProfile) return;
    const updated = { ...userProfile, role: newRole };
    setUserProfile(updated);
    try {
      await setDoc(doc(db, 'users', user.uid), { role: newRole }, { merge: true });
    } catch {
      // Local state is updated
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const currentRole: UserRole = userProfile?.role || 'user';
  const isAdmin = currentRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role: currentRole,
        isAdmin,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
