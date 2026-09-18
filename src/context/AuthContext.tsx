'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
import { auth, db, safeFirestoreCall } from '@/lib/firebase';
import { SubscriptionPlanId } from '@/types';
import {
  calculateRealtimeCountdown,
  FormattedCountdown,
  checkDeviceTrialStatus,
  recordDeviceTrial,
  DeviceTrialRecord,
  checkDeviceAndEmailFreePlanInFirestore,
  getOrCreateDeviceId,
} from '@/services/subscriptionService';
import { notifyPlanActivation } from '@/services/notificationService';

export type UserRole = 'user' | 'admin';

// =========================================================================
// REGRA ABSOLUTA DE SEGURANÇA WORSCOI:
// Nunca temos 2 ou mais admins, apenas 1 único: miguelworscoi@gmail.com
// Palavra-passe oficial: worscoi2004
// Nenhuma outra conta pode ser aceita como admin sob nenhuma circunstância.
// =========================================================================
export const OFFICIAL_ADMIN_EMAIL = 'miguelworscoi@gmail.com';
export const OFFICIAL_ADMIN_PASSWORD = 'worscoi2004';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  plan?: SubscriptionPlanId;
  planName?: string;
  planExpiresAt?: string | null;
  planActivatedAt?: string | null;
  activatedToken?: string | null;
  hasSeenTutorial?: boolean;
  tutorialCompletedAt?: string | null;
}

export interface LocalUserRecord extends UserProfile {
  password?: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export type AnyUser = User | AuthUser;

interface AuthContextType {
  user: AnyUser | null;
  userProfile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  countdown: FormattedCountdown;
  isSubscriptionExpired: boolean;
  isAccountClosedDueToExpiration: boolean;
  closeExpiredNotice: () => void;
  isFreePlanBlocked: boolean;
  freePlanBlockedDetails: {
    email?: string;
    deviceId?: string;
    message: string;
    reason?: 'device_already_used' | 'email_already_used' | 'trial_expired';
  } | null;
  closeFreePlanBlockedAlert: () => void;
  triggerFreePlanBlocked: (details: {
    email?: string;
    deviceId?: string;
    message?: string;
    reason?: 'device_already_used' | 'email_already_used' | 'trial_expired';
  }) => void;
  deviceTrial: {
    hasClaimed: boolean;
    isExpired: boolean;
    timeRemainingMs: number;
    trialRecord?: DeviceTrialRecord;
  } | null;
  refreshDeviceTrial: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    pass: string,
    name: string,
    selectedRole?: UserRole,
    plan?: SubscriptionPlanId,
    planName?: string,
    tokenCode?: string | null,
    planExpiresAt?: string | null
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  updateProfilePlan: (
    plan: SubscriptionPlanId,
    planName: string,
    expiresAt?: string | null,
    tokenCode?: string | null,
    stackingInfo?: {
      accumulated?: boolean;
      addedDays?: number;
      remainingDaysTotal?: number;
    }
  ) => void;
  shouldShowFirstTimeTutorial: boolean;
  completeTutorial: () => Promise<void>;
  openTutorialManually: () => void;
  closeTutorialModal: () => void;
}

export const TUTORIAL_STORAGE_KEY_PREFIX = 'worscoi_tutorial_seen_';

export function isTutorialSeenForUser(userEmailOrId?: string | null): boolean {
  if (!userEmailOrId) return false;
  const key = (userEmailOrId || '').trim().toLowerCase();
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY_PREFIX + key) === 'true';
  } catch {
    return false;
  }
}

export function setTutorialSeenForUser(userEmailOrId?: string | null) {
  if (!userEmailOrId) return;
  const key = (userEmailOrId || '').trim().toLowerCase();
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY_PREFIX + key, 'true');
  } catch {
    // Ignora erro
  }
}

export function normalizeIdentifier(raw: string): { email: string; displayName: string; isPhone: boolean } {
  const clean = (raw || '').trim();
  const digitsOnly = clean.replace(/[\s+()-]/g, '');
  const isPhone = /^\d{8,14}$/.test(digitsOnly);

  if (isPhone) {
    return {
      email: `${digitsOnly}@worscoi.ao`,
      displayName: `Tel: ${digitsOnly}`,
      isPhone: true,
    };
  }

  if (clean.includes('@')) {
    const parts = clean.split('@');
    return {
      email: clean.toLowerCase(),
      displayName: clean.toLowerCase() === OFFICIAL_ADMIN_EMAIL.toLowerCase() ? 'Miguel Worscoi' : (parts[0] || 'Usuário'),
      isPhone: false,
    };
  }

  // Se o usuário digitar apenas "miguelworscoi", reconhece automaticamente a conta de administrador
  if (clean.toLowerCase() === 'miguelworscoi') {
    return {
      email: OFFICIAL_ADMIN_EMAIL.toLowerCase(),
      displayName: 'Miguel Worscoi',
      isPhone: false,
    };
  }

  const safeUsername = clean.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return {
    email: `${safeUsername || 'usuario'}@worscoi.com`,
    displayName: clean || 'Usuário',
    isPhone: false,
  };
}

const LOCAL_SESSION_KEY = 'worscoi_auth_session';
const LEGACY_SESSION_KEY = 'playsports_auth_session';
const LOCAL_REGISTRY_KEY = 'worscoi_user_registry';
const LEGACY_REGISTRY_KEY = 'playsports_user_registry';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AnyUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<FormattedCountdown>(() =>
    calculateRealtimeCountdown(null)
  );
  const [isAccountClosedDueToExpiration, setIsAccountClosedDueToExpiration] = useState(false);
  const [isFreePlanBlocked, setIsFreePlanBlocked] = useState(false);
  const [freePlanBlockedDetails, setFreePlanBlockedDetails] = useState<{
    email?: string;
    deviceId?: string;
    message: string;
    reason?: 'device_already_used' | 'email_already_used' | 'trial_expired';
  } | null>(null);

  const triggerFreePlanBlocked = useCallback(
    (details: {
      email?: string;
      deviceId?: string;
      message?: string;
      reason?: 'device_already_used' | 'email_already_used' | 'trial_expired';
    }) => {
      setIsFreePlanBlocked(true);
      setFreePlanBlockedDetails({
        email: details.email,
        deviceId: details.deviceId || getOrCreateDeviceId(),
        message:
          details.message ||
          'Este dispositivo ou e-mail já utilizou o período de teste gratuito anteriormente. Por favor, atualize para um plano a partir de 1.500 Kz para continuar assistindo.',
        reason: details.reason || 'device_already_used',
      });
    },
    []
  );

  const closeFreePlanBlockedAlert = useCallback(() => {
    setIsFreePlanBlocked(false);
  }, []);

  const [deviceTrial, setDeviceTrial] = useState<{
    hasClaimed: boolean;
    isExpired: boolean;
    timeRemainingMs: number;
    trialRecord?: DeviceTrialRecord;
  } | null>(null);

  const refreshDeviceTrial = useCallback(async () => {
    try {
      const status = await checkDeviceTrialStatus();
      setDeviceTrial(status);
      if (status.hasClaimed && status.isExpired) {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_SESSION_KEY) : null;
        if (saved) {
          const parsed = JSON.parse(saved) as UserProfile;
          if (parsed && parsed.role !== 'admin' && (!parsed.plan || parsed.plan === 'free')) {
            triggerFreePlanBlocked({
              email: parsed.email,
              deviceId: status.trialRecord?.deviceId || getOrCreateDeviceId(),
              reason: 'trial_expired',
              message:
                'O período de teste gratuito de 24 horas deste dispositivo expirou. Por favor, assine um de nossos planos a partir de 1.500 Kz para continuar aproveitando nossa grade ao vivo.',
            });
          }
        }
      }
    } catch {
      // Ignora
    }
  }, [triggerFreePlanBlocked]);

  const closeExpiredNotice = useCallback(() => {
    setIsAccountClosedDueToExpiration(false);
  }, []);

  // Monitora o status do dispositivo no mount
  useEffect(() => {
    refreshDeviceTrial();
  }, [refreshDeviceTrial]);

  // Cronômetro em tempo real executado a cada 1 segundo
  useEffect(() => {
    const updateCountdown = () => {
      if (!userProfile) {
        setCountdown(calculateRealtimeCountdown(null));
        return;
      }

      const nextCountdown = calculateRealtimeCountdown(userProfile);
      setCountdown(nextCountdown);

      // Quando o cronômetro chega ao zero (00:00:00) em planos de usuário
      if (nextCountdown.expired && userProfile.role !== 'admin') {
        setIsAccountClosedDueToExpiration(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [userProfile]);

  // REGRA ABSOLUTA DE SEGURANÇA WORSCOI:
  // Nunca temos 2 ou mais admins, só 1: miguelworscoi@gmail.com.
  // Palavra-passe: worscoi2004.
  // Nenhuma outra conta pode ser aceita como admin além dessa.
  const resolveRole = (identifier?: string | null, _savedRole?: string): UserRole => {
    if (!identifier) return 'user';
    const lower = identifier.trim().toLowerCase();
    if (lower === OFFICIAL_ADMIN_EMAIL.toLowerCase()) {
      return 'admin';
    }
    return 'user';
  };

  const getLocalRegistry = (): LocalUserRecord[] => {
    try {
      const data =
        localStorage.getItem(LOCAL_REGISTRY_KEY) || localStorage.getItem(LEGACY_REGISTRY_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // Garante estritamente que NENHUM outro usuário além de miguelworscoi@gmail.com seja admin
          return parsed.map((u) => {
            const isOfficialAdmin = (u.email || '').trim().toLowerCase() === OFFICIAL_ADMIN_EMAIL.toLowerCase();
            return {
              ...u,
              role: isOfficialAdmin ? 'admin' : 'user',
            };
          });
        }
      }
    } catch {
      // Ignora
    }
    return [];
  };

  const saveInRegistry = (record: LocalUserRecord) => {
    try {
      // Garante estritamente que apenas miguelworscoi@gmail.com seja gravado como admin
      const isOfficialAdmin = (record.email || '').trim().toLowerCase() === OFFICIAL_ADMIN_EMAIL.toLowerCase();
      const sanitizedRecord: LocalUserRecord = {
        ...record,
        role: isOfficialAdmin ? 'admin' : 'user',
      };
      const list = getLocalRegistry().filter(
        (u) => u.email.toLowerCase() !== sanitizedRecord.email.toLowerCase() && u.id !== sanitizedRecord.id
      );
      list.push(sanitizedRecord);
      localStorage.setItem(LOCAL_REGISTRY_KEY, JSON.stringify(list));
    } catch {
      // Ignora
    }
  };

  const [shouldShowFirstTimeTutorial, setShouldShowFirstTimeTutorial] = useState(false);

  const saveSession = (rawProfile: UserProfile) => {
    const isOfficialAdmin = (rawProfile.email || '').trim().toLowerCase() === OFFICIAL_ADMIN_EMAIL.toLowerCase();
    const hasSeen = Boolean(
      rawProfile.hasSeenTutorial ||
      isTutorialSeenForUser(rawProfile.email) ||
      isTutorialSeenForUser(rawProfile.id)
    );
    const profile: UserProfile = {
      ...rawProfile,
      // Se não for miguelworscoi@gmail.com, o papel é FORÇADO a ser 'user'
      role: isOfficialAdmin ? rawProfile.role : 'user',
      hasSeenTutorial: hasSeen,
    };
    if (hasSeen) {
      if (profile.email) setTutorialSeenForUser(profile.email);
      if (profile.id) setTutorialSeenForUser(profile.id);
    }

    if (profile.role === 'admin') {
      profile.plan = profile.plan || 'anual';
      profile.planName = profile.planName || 'Acesso Total Administrador';
      profile.planExpiresAt = null;
    } else {
      profile.plan = profile.plan || 'free';
      profile.planName = profile.planName || 'Plano Gratuito (Teste 24h)';
      if (!profile.planExpiresAt && profile.plan === 'free') {
        const created = profile.createdAt ? new Date(profile.createdAt).getTime() : Date.now();
        // 1 dia = 24 horas = 86400000 ms
        profile.planExpiresAt = new Date(created + 24 * 60 * 60 * 1000).toISOString();
      }
    }

    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
    } catch {
      // Ignora erro de localStorage
    }

    saveInRegistry(profile);
    setUserProfile(profile);
    setUser({
      uid: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      photoURL: profile.photoURL || null,
    });
  };

  const completeTutorial = useCallback(async () => {
    setShouldShowFirstTimeTutorial(false);
    if (userProfile && userProfile.email) {
      setTutorialSeenForUser(userProfile.email);
      setTutorialSeenForUser(userProfile.id);
      const completedAt = new Date().toISOString();
      const updated: UserProfile = {
        ...userProfile,
        hasSeenTutorial: true,
        tutorialCompletedAt: completedAt,
      };
      saveSession(updated);
      saveInRegistry(updated);
      if (user?.uid) {
        try {
          await safeFirestoreCall(
            () =>
              setDoc(
                doc(db, 'users', user.uid),
                {
                  hasSeenTutorial: true,
                  tutorialCompletedAt: completedAt,
                },
                { merge: true }
              ),
            null,
            2000
          );
        } catch {
          // Ignora
        }
      }
    }
  }, [userProfile, user?.uid]);

  const openTutorialManually = useCallback(() => {
    setShouldShowFirstTimeTutorial(true);
  }, []);

  const closeTutorialModal = useCallback(() => {
    completeTutorial();
  }, [completeTutorial]);

  // Garante a existência do administrador oficial único no registro local
  useEffect(() => {
    try {
      const registry = getLocalRegistry();
      const adminAcc = registry.find(
        (u) => (u.email || '').toLowerCase() === OFFICIAL_ADMIN_EMAIL.toLowerCase()
      );
      if (!adminAcc) {
        saveInRegistry({
          id: 'admin_miguelworscoi',
          email: OFFICIAL_ADMIN_EMAIL,
          displayName: 'Miguel Worscoi',
          role: 'admin',
          password: OFFICIAL_ADMIN_PASSWORD,
          createdAt: '2026-01-01T00:00:00.000Z',
          plan: 'anual',
          planName: 'Acesso Total Administrador',
          planExpiresAt: null,
        });
      } else if (adminAcc.password !== OFFICIAL_ADMIN_PASSWORD || adminAcc.role !== 'admin') {
        saveInRegistry({
          ...adminAcc,
          role: 'admin',
          password: OFFICIAL_ADMIN_PASSWORD,
        });
      }
    } catch {
      // Ignora
    }
  }, []);

  // Carrega sessão salva imediatamente no boot com fallback rápido
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY) || localStorage.getItem(LEGACY_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as UserProfile;
        if (parsed && parsed.email) {
          // Garante que nenhuma sessão anterior indevida permaneça com papel de admin
          if (parsed.role === 'admin' && parsed.email.trim().toLowerCase() !== OFFICIAL_ADMIN_EMAIL.toLowerCase()) {
            parsed.role = 'user';
            try {
              localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(parsed));
            } catch {
              // Ignora
            }
          }
          setUserProfile(parsed);
          setUser({
            uid: parsed.id || 'local_' + Math.random().toString(36).substring(2, 9),
            email: parsed.email,
            displayName: parsed.displayName || parsed.email.split('@')[0],
            photoURL: parsed.photoURL || null,
          });
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignora
    }

    // Se nenhuma sessão existir, inicializa sessão de espectador gratuita para exibir a aplicação imediatamente
    const guestProfile: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      email: 'espectador@worscoi.tv',
      displayName: 'Espectador',
      photoURL: '',
      role: 'user',
      createdAt: new Date().toISOString(),
      plan: 'free',
      planName: 'Plano Gratuito (Teste 24h)',
      planExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    saveSession(guestProfile);
    setLoading(false);
  }, []);

  // Firebase auth state change listener com recuperação resiliente da sessão local
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            try {
              const userDocRef = doc(db, 'users', currentUser.uid);
              const snap = await safeFirestoreCall(() => getDoc(userDocRef), null, 2500);
              if (snap && snap.exists()) {
                const data = snap.data();
                const role = resolveRole(currentUser.email, data.role);
                const profile: UserProfile = {
                  id: currentUser.uid,
                  email: currentUser.email || '',
                  displayName:
                    data.displayName ||
                    currentUser.displayName ||
                    currentUser.email?.split('@')[0] ||
                    'Usuário',
                  photoURL: currentUser.photoURL || '',
                  role,
                  createdAt: data.createdAt || new Date().toISOString(),
                  plan: data.plan,
                  planName: data.planName,
                  planExpiresAt: data.planExpiresAt,
                  activatedToken: data.activatedToken,
                };
                saveSession(profile);
              } else {
                const initialRole = resolveRole(currentUser.email);
                const profileData: UserProfile = {
                  id: currentUser.uid,
                  email: currentUser.email || '',
                  displayName:
                    currentUser.displayName ||
                    currentUser.email?.split('@')[0] ||
                    'Usuário',
                  photoURL: currentUser.photoURL || '',
                  role: initialRole,
                  createdAt: new Date().toISOString(),
                };
                await safeFirestoreCall(
                  () => setDoc(userDocRef, profileData, { merge: true }),
                  null,
                  2000
                );
                saveSession(profileData);
              }
            } catch {
              const initialRole = resolveRole(currentUser.email);
              const fallbackProfile: UserProfile = {
                id: currentUser.uid,
                email: currentUser.email || '',
                displayName:
                  currentUser.displayName ||
                  currentUser.email?.split('@')[0] ||
                  'Usuário',
                role: initialRole,
                createdAt: new Date().toISOString(),
              };
              saveSession(fallbackProfile);
            }
          } else {
            // Se Firebase não tem usuário, restaura sessão local persistente se disponível
            try {
              const saved = localStorage.getItem(LOCAL_SESSION_KEY);
              if (saved) {
                const parsed = JSON.parse(saved) as UserProfile;
                if (parsed && parsed.email) {
                  setUserProfile(parsed);
                  setUser({
                    uid: parsed.id || 'local_' + Math.random().toString(36).substring(2, 9),
                    email: parsed.email,
                    displayName: parsed.displayName || parsed.email.split('@')[0],
                    photoURL: parsed.photoURL || null,
                  });
                }
              } else {
                // Primeira visita ou sem sessão: sincroniza com o dispositivo para garantir contagem ininterrupta
                const devStatus = await checkDeviceTrialStatus();
                let trialExpiry = devStatus.trialRecord?.expiresAt;

                if (!devStatus.hasClaimed) {
                  const newRec = await recordDeviceTrial('espectador@worscoi.tv', 'convidado');
                  trialExpiry = newRec.expiresAt;
                }

                const guestProfile: UserProfile = {
                  id: 'guest_' + Math.random().toString(36).substring(2, 9),
                  email: 'espectador@worscoi.tv',
                  displayName: 'Espectador Esportivo',
                  photoURL: '',
                  role: 'user',
                  createdAt: devStatus.trialRecord?.claimedAt || new Date().toISOString(),
                  plan: 'free',
                  planName: 'Plano Gratuito (Teste 24h)',
                  planExpiresAt: trialExpiry || null,
                };
                saveSession(guestProfile);

                if (devStatus.hasClaimed && devStatus.isExpired) {
                  setIsAccountClosedDueToExpiration(true);
                }
              }
            } catch {
              // Mantém sessão resiliente
            }
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Firebase onAuthStateChanged subscription error:', error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn('Could not initialize onAuthStateChanged listener:', err);
      setLoading(false);
    }

    return () => {
      try {
        unsubscribe();
      } catch {
        // Ignora erro ao desinscrever
      }
    };
  }, []);

  const signInWithEmail = async (identifier: string, pass: string) => {
    const rawInput = (identifier || '').trim();
    if (!rawInput) {
      throw new Error('Por favor, informe seu e-mail, telefone ou nome de usuário.');
    }
    const passClean = (pass || '').trim();
    if (!passClean) {
      throw new Error('Por favor, informe sua palavra-passe.');
    }

    const { email: cleanEmail, displayName, isPhone } = normalizeIdentifier(rawInput);
    const deviceId = getOrCreateDeviceId();
    const isTargetingAdmin = cleanEmail.toLowerCase() === OFFICIAL_ADMIN_EMAIL.toLowerCase();

    // =========================================================================
    // 1. CONTA OFICIAL DO ÚNICO ADMINISTRADOR: miguelworscoi@gmail.com
    // Palavra-passe oficial: worscoi2004
    // =========================================================================
    if (isTargetingAdmin) {
      if (passClean !== OFFICIAL_ADMIN_PASSWORD) {
        throw new Error('Palavra-passe incorreta para a conta oficial de administrador.');
      }

      const adminHasSeen = isTutorialSeenForUser(OFFICIAL_ADMIN_EMAIL);
      const adminProfile: UserProfile = {
        id: 'admin_miguelworscoi',
        email: OFFICIAL_ADMIN_EMAIL,
        displayName: 'Miguel Worscoi',
        photoURL: '',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00.000Z',
        plan: 'anual',
        planName: 'Acesso Total Administrador',
        planExpiresAt: null,
        hasSeenTutorial: adminHasSeen,
      };

      saveSession(adminProfile);
      saveInRegistry({ ...adminProfile, password: OFFICIAL_ADMIN_PASSWORD });
      if (!adminHasSeen) {
        setShouldShowFirstTimeTutorial(true);
      } else {
        setShouldShowFirstTimeTutorial(false);
      }

      try {
        await signInWithEmailAndPassword(auth, OFFICIAL_ADMIN_EMAIL, OFFICIAL_ADMIN_PASSWORD);
      } catch {
        try {
          await createUserWithEmailAndPassword(auth, OFFICIAL_ADMIN_EMAIL, OFFICIAL_ADMIN_PASSWORD);
        } catch {
          // Mantém sessão local autenticada
        }
      }

      try {
        await safeFirestoreCall(
          () => setDoc(doc(db, 'users', adminProfile.id), adminProfile, { merge: true }),
          null,
          2000
        );
      } catch {
        // Ignora erro Firestore
      }

      return;
    }

    // =========================================================================
    // 2. QUALQUER OUTRA CONTA (ESTRITAMENTE PAPEL 'user', NUNCA ADMIN)
    // =========================================================================
    // 2.1 Tenta Firebase Auth primeiro
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, passClean);
      if (cred.user) {
        const role: UserRole = 'user'; // REGRA: NUNCA aceita outra conta como admin
        let userPlan: SubscriptionPlanId | undefined = 'free';
        let planName: string | undefined = undefined;
        let planExpiresAt: string | null = null;
        let activatedToken: string | null = null;
        let createdAt = new Date().toISOString();

        const hasSeenLocally = isTutorialSeenForUser(cleanEmail);
        let hasSeenFirestore = false;
        let tutorialCompletedAt: string | null = null;

        try {
          const userDocRef = doc(db, 'users', cred.user.uid);
          const snap = await safeFirestoreCall(() => getDoc(userDocRef), null, 2000);
          if (snap && snap.exists()) {
            const data = snap.data();
            userPlan = data.plan;
            planName = data.planName;
            planExpiresAt = data.planExpiresAt ?? null;
            activatedToken = data.activatedToken ?? null;
            if (data.createdAt) createdAt = data.createdAt;
            if (data.hasSeenTutorial) {
              hasSeenFirestore = true;
              tutorialCompletedAt = data.tutorialCompletedAt || null;
            }
          }
        } catch {
          // Ignora se Firestore não responder
        }

        const isTutorialAlreadySeen = hasSeenLocally || hasSeenFirestore;

        const isPaidActive =
          userPlan &&
          userPlan !== 'free' &&
          (!planExpiresAt || new Date(planExpiresAt).getTime() > Date.now());

        if (!isPaidActive) {
          const checkResult = await checkDeviceAndEmailFreePlanInFirestore(
            cleanEmail,
            role,
            userPlan,
            planExpiresAt
          );

          if (checkResult.isBlocked) {
            try {
              await firebaseSignOut(auth);
            } catch {
              // Ignora
            }
            triggerFreePlanBlocked({
              email: cleanEmail,
              deviceId: checkResult.deviceId || deviceId,
              message: checkResult.message,
              reason: checkResult.reason,
            });
            throw new Error(
              checkResult.message ||
                'Acesso bloqueado: Este dispositivo ou e-mail já utilizou o plano gratuito anteriormente. Por favor, atualize para um plano pago a partir de 1.500 Kz ou ative um Código de 5 Dígitos.'
            );
          }
        }

        const profile: UserProfile = {
          id: cred.user.uid,
          email: cred.user.email || cleanEmail,
          displayName: cred.user.displayName || displayName || 'Usuário',
          photoURL: cred.user.photoURL || '',
          role: 'user', // Forçado estritamente para 'user'
          createdAt,
          plan: userPlan,
          planName,
          planExpiresAt,
          activatedToken,
          hasSeenTutorial: isTutorialAlreadySeen,
          tutorialCompletedAt,
        };
        saveSession(profile);
        saveInRegistry({ ...profile, password: passClean });

        if (!isTutorialAlreadySeen) {
          setShouldShowFirstTimeTutorial(true);
        } else {
          setShouldShowFirstTimeTutorial(false);
        }
        return;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Acesso bloqueado')) {
        throw err;
      }
    }

    // 2.2 Registro local
    const registry = getLocalRegistry();
    const existing = registry.find((u) => {
      const uEmail = (u.email || '').toLowerCase();
      const targetEmail = cleanEmail.toLowerCase();
      return (
        uEmail === targetEmail ||
        (isPhone && uEmail.includes(cleanEmail.split('@')[0])) ||
        (u.displayName && u.displayName.toLowerCase() === rawInput.toLowerCase())
      );
    });

    if (existing) {
      if (existing.password && passClean && existing.password !== passClean) {
        throw new Error('Palavra-passe incorreta para esta conta.');
      }

      const userRole: UserRole = 'user'; // NUNCA aceita outra conta como admin
      const userPlan = existing.plan;
      const planExpiresAt = existing.planExpiresAt;
      const isPaidActive =
        userPlan &&
        userPlan !== 'free' &&
        (!planExpiresAt || new Date(planExpiresAt).getTime() > Date.now());

      if (!isPaidActive) {
        const checkResult = await checkDeviceAndEmailFreePlanInFirestore(
          cleanEmail,
          userRole,
          userPlan,
          planExpiresAt
        );

        if (checkResult.isBlocked) {
          triggerFreePlanBlocked({
            email: cleanEmail,
            deviceId: checkResult.deviceId || deviceId,
            message: checkResult.message,
            reason: checkResult.reason,
          });
          throw new Error(
            checkResult.message ||
              'Acesso bloqueado: Este dispositivo ou e-mail já utilizou o período gratuito anteriormente. Por favor, atualize para um plano pago a partir de 1.500 Kz para continuar assistindo.'
          );
        }
      }

      const localHasSeen = isTutorialSeenForUser(cleanEmail) || Boolean(existing.hasSeenTutorial);
      const profile: UserProfile = {
        id: existing.id,
        email: existing.email,
        displayName: existing.displayName || displayName,
        photoURL: existing.photoURL || '',
        role: 'user', // NUNCA aceita outra conta como admin
        createdAt: existing.createdAt || new Date().toISOString(),
        plan: existing.plan,
        planName: existing.planName,
        planExpiresAt: existing.planExpiresAt,
        activatedToken: existing.activatedToken,
        hasSeenTutorial: localHasSeen,
        tutorialCompletedAt: existing.tutorialCompletedAt,
      };
      saveSession(profile);
      if (!localHasSeen) {
        setShouldShowFirstTimeTutorial(true);
      } else {
        setShouldShowFirstTimeTutorial(false);
      }
      return;
    }

    // 2.3 Se for nova conta tentando login sem cadastro prévio
    const checkResult = await checkDeviceAndEmailFreePlanInFirestore(cleanEmail, 'user', 'free');
    if (checkResult.isBlocked) {
      triggerFreePlanBlocked({
        email: cleanEmail,
        deviceId: checkResult.deviceId || deviceId,
        message: checkResult.message,
        reason: checkResult.reason,
      });
      throw new Error(
        checkResult.message ||
          'Acesso bloqueado: Este dispositivo ou e-mail já utilizou o período gratuito anteriormente. Por favor, assine um plano pago a partir de 1.500 Kz ou ative um Código de 5 Dígitos para assistir.'
      );
    }

    const newProfile: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      displayName: displayName,
      photoURL: '',
      role: 'user', // NUNCA aceita outra conta como admin
      createdAt: new Date().toISOString(),
      plan: 'free',
      planName: 'Plano Gratuito (Teste 24h)',
      planExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      hasSeenTutorial: false,
    };

    await recordDeviceTrial(cleanEmail, newProfile.id, newProfile.planExpiresAt || undefined);
    refreshDeviceTrial();

    saveInRegistry({ ...newProfile, password: passClean });
    saveSession(newProfile);
    setShouldShowFirstTimeTutorial(true);

    try {
      await safeFirestoreCall(
        () => setDoc(doc(db, 'users', newProfile.id), newProfile, { merge: true }),
        null,
        2000
      );
    } catch {
      // Ignora erro
    }
  };

  const signUpWithEmail = async (
    identifier: string,
    pass: string,
    name: string,
    _selectedRole: UserRole = 'user',
    plan?: SubscriptionPlanId,
    planName?: string,
    tokenCode?: string | null,
    planExpiresAt?: string | null
  ) => {
    const rawInput = (identifier || '').trim();
    if (!rawInput) throw new Error('E-mail, telefone ou nome de usuário é obrigatório.');
    const passClean = (pass || '').trim();
    if (!passClean) throw new Error('A palavra-passe é obrigatória.');

    const { email: cleanEmail, displayName } = normalizeIdentifier(rawInput);
    const isTargetingAdmin = cleanEmail.toLowerCase() === OFFICIAL_ADMIN_EMAIL.toLowerCase();

    // REGRA ABSOLUTA DE SEGURANÇA:
    // Nunca aceita outra conta como admin além de miguelworscoi@gmail.com com a senha worscoi2004
    if (isTargetingAdmin) {
      if (passClean !== OFFICIAL_ADMIN_PASSWORD) {
        throw new Error('Palavra-passe não autorizada para a conta de administrador.');
      }
    }

    const finalRole: UserRole = isTargetingAdmin ? 'admin' : 'user';
    const finalName = (name || '').trim() || (isTargetingAdmin ? 'Miguel Worscoi' : displayName);

    // Determina o plano inicial
    const assignedPlan = finalRole === 'admin' ? undefined : (plan || 'free');
    let resolvedExpiresAt = planExpiresAt;

    if (assignedPlan === 'free') {
      const checkResult = await checkDeviceAndEmailFreePlanInFirestore(
        cleanEmail,
        finalRole,
        'free'
      );
      if (checkResult.isBlocked) {
        triggerFreePlanBlocked({
          email: cleanEmail,
          deviceId: checkResult.deviceId || getOrCreateDeviceId(),
          message: checkResult.message,
          reason: checkResult.reason,
        });
        throw new Error(
          checkResult.message ||
            'Este dispositivo ou e-mail já utilizou o teste gratuito de 1 dia (24 horas). Não é permitido criar novas contas gratuitas no mesmo aparelho. Por favor, escolha um dos nossos planos a partir de 1.500 Kz ou ative um Código de 5 Dígitos.'
        );
      }

      const devStatus = await checkDeviceTrialStatus();
      if (devStatus.hasClaimed && !devStatus.isExpired && devStatus.trialRecord) {
        resolvedExpiresAt = devStatus.trialRecord.expiresAt;
      } else {
        if (!resolvedExpiresAt) {
          resolvedExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        }
        await recordDeviceTrial(cleanEmail, 'new_user', resolvedExpiresAt);
      }
      refreshDeviceTrial();
    }

    let firebaseUid: string | null = null;
    if (passClean.length >= 6) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, passClean);
        if (cred.user) {
          firebaseUid = cred.user.uid;
          if (finalName) {
            await updateProfile(cred.user, { displayName: finalName });
          }
        }
      } catch {
        // Prossegue com cadastro local seguro
      }
    }

    const userId =
      firebaseUid ||
      (finalRole === 'admin' ? 'admin_miguelworscoi' : 'usr_' + Math.random().toString(36).substring(2, 10));

    const nowIso = new Date().toISOString();
    const profileData: UserProfile = {
      id: userId,
      email: cleanEmail,
      displayName: finalName,
      role: finalRole,
      createdAt: nowIso,
      plan: assignedPlan,
      planName: planName || (assignedPlan === 'free' ? 'Plano Gratuito (Teste 24h)' : undefined),
      planExpiresAt: resolvedExpiresAt ?? null,
      planActivatedAt: nowIso,
      activatedToken: tokenCode || null,
      hasSeenTutorial: false,
    };

    saveInRegistry({ ...profileData, password: passClean });
    saveSession(profileData);
    setShouldShowFirstTimeTutorial(true);

    if (assignedPlan) {
      notifyPlanActivation({
        userId,
        userEmail: cleanEmail,
        planName: profileData.planName || 'Plano',
        activatedAt: nowIso,
        expiresAt: resolvedExpiresAt,
        tokenCode,
      }).catch(() => {});
    }

    try {
      await safeFirestoreCall(
        () => setDoc(doc(db, 'users', userId), profileData, { merge: true }),
        null,
        2000
      );
    } catch {
      // Silently fall back
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        const role = resolveRole(res.user.email);
        const googleEmail = res.user.email || 'google.user@worscoi.tv';

        if (role !== 'admin') {
          // Verifica no Firestore o deviceId único e o e-mail
          const checkResult = await checkDeviceAndEmailFreePlanInFirestore(
            googleEmail,
            role,
            'free'
          );
          if (checkResult.isBlocked) {
            try {
              await firebaseSignOut(auth);
            } catch {
              // Ignora
            }
            triggerFreePlanBlocked({
              email: googleEmail,
              deviceId: checkResult.deviceId || getOrCreateDeviceId(),
              message: checkResult.message,
              reason: checkResult.reason,
            });
            throw new Error(
              checkResult.message ||
                'Acesso bloqueado: Este dispositivo ou e-mail já utilizou o teste gratuito anteriormente. Por favor, assine um plano pago a partir de 1.500 Kz para liberar o acesso.'
            );
          }
        }

        const googleHasSeen = isTutorialSeenForUser(googleEmail);
        const profile: UserProfile = {
          id: res.user.uid,
          email: googleEmail,
          displayName: res.user.displayName || 'Usuário Google',
          photoURL: res.user.photoURL || '',
          role,
          createdAt: new Date().toISOString(),
          hasSeenTutorial: googleHasSeen,
        };
        saveSession(profile);
        if (!googleHasSeen) {
          setShouldShowFirstTimeTutorial(true);
        } else {
          setShouldShowFirstTimeTutorial(false);
        }
        return;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Acesso bloqueado')) {
        throw err;
      }
      console.warn('Google Auth popup restrito ou indisponível:', err);
    }

    // Fallback gracioso para ambiente de iframe e testes
    const googleEmail = 'usuario.google@worscoi.tv';
    const checkResult = await checkDeviceAndEmailFreePlanInFirestore(googleEmail, 'user', 'free');
    if (checkResult.isBlocked) {
      triggerFreePlanBlocked({
        email: googleEmail,
        deviceId: checkResult.deviceId || getOrCreateDeviceId(),
        message: checkResult.message,
        reason: checkResult.reason,
      });
      throw new Error(
        checkResult.message ||
          'Este dispositivo já utilizou o teste gratuito de 24 horas anteriormente. Por favor, atualize para um plano a partir de 1.500 Kz para continuar assistindo.'
      );
    }

    const fallbackHasSeen = isTutorialSeenForUser(googleEmail);
    const googleProfile: UserProfile = {
      id: 'google_' + Math.random().toString(36).substring(2, 9),
      email: googleEmail,
      displayName: 'Usuário Google (Ao Vivo)',
      photoURL: '',
      role: 'user',
      createdAt: new Date().toISOString(),
      hasSeenTutorial: fallbackHasSeen,
    };
    saveSession(googleProfile);
    if (!fallbackHasSeen) {
      setShouldShowFirstTimeTutorial(true);
    } else {
      setShouldShowFirstTimeTutorial(false);
    }
  };

  const signInAsGuest = async (_chosenRole: UserRole = 'user') => {
    // REGRA: Convidados NUNCA podem ser administradores. Apenas miguelworscoi@gmail.com é admin.
    const assignedPlan: SubscriptionPlanId = 'free';
    let resolvedExpiresAt: string;

    // Verifica no Firestore o deviceId único
    const checkResult = await checkDeviceAndEmailFreePlanInFirestore(
      'espectador@worscoi.tv',
      'user',
      'free'
    );
    if (checkResult.isBlocked) {
      triggerFreePlanBlocked({
        email: 'espectador@worscoi.tv',
        deviceId: checkResult.deviceId || getOrCreateDeviceId(),
        message: checkResult.message,
        reason: checkResult.reason,
      });
      throw new Error(
        checkResult.message ||
          'Este dispositivo já utilizou o teste gratuito de 1 dia (24 horas). Para continuar assistindo à programação esportiva, assine um plano a partir de 1.500 Kz ou ative um Código de 5 Dígitos.'
      );
    }

    const devStatus = await checkDeviceTrialStatus();
    if (devStatus.hasClaimed && !devStatus.isExpired && devStatus.trialRecord) {
      resolvedExpiresAt = devStatus.trialRecord.expiresAt;
    } else {
      resolvedExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await recordDeviceTrial('espectador@worscoi.tv', 'convidado', resolvedExpiresAt);
    }
    refreshDeviceTrial();

    const guestNowIso = new Date().toISOString();
    const profile: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      email: 'espectador@worscoi.tv',
      displayName: 'Espectador Esportivo',
      photoURL: '',
      role: 'user', // NUNCA aceita admin aqui
      createdAt: guestNowIso,
      plan: assignedPlan,
      planName: 'Plano Gratuito (Teste 24h)',
      planExpiresAt: resolvedExpiresAt,
      planActivatedAt: guestNowIso,
    };
    saveInRegistry({ ...profile, password: 'guest' });
    saveSession(profile);

    notifyPlanActivation({
      userId: profile.id,
      userEmail: profile.email,
      planName: profile.planName || 'Plano Gratuito (Teste 24h)',
      activatedAt: guestNowIso,
      expiresAt: resolvedExpiresAt,
    }).catch(() => {});
  };

  const switchRole = async (newRole: UserRole) => {
    if (!userProfile) return;
    // REGRA ABSOLUTA: Apenas a conta oficial miguelworscoi@gmail.com pode assumir papel de admin
    if (newRole === 'admin' && userProfile.email.toLowerCase() !== OFFICIAL_ADMIN_EMAIL.toLowerCase()) {
      throw new Error('Apenas a conta oficial miguelworscoi@gmail.com pode assumir o papel de administrador.');
    }
    const updated: UserProfile = { ...userProfile, role: newRole };
    saveSession(updated);

    if (user) {
      try {
        await safeFirestoreCall(
          () => setDoc(doc(db, 'users', user.uid), { role: newRole }, { merge: true }),
          null,
          2000
        );
      } catch {
        // Ignora
      }
    }
  };

  const updateProfilePlan = (
    plan: SubscriptionPlanId,
    planName: string,
    expiresAt?: string | null,
    tokenCode?: string | null,
    stackingInfo?: {
      accumulated?: boolean;
      addedDays?: number;
      remainingDaysTotal?: number;
    }
  ) => {
    if (!userProfile) return;
    const activatedAt = new Date().toISOString();
    const resolvedExpiresAt = expiresAt ?? userProfile.planExpiresAt;
    const updated: UserProfile = {
      ...userProfile,
      plan,
      planName,
      planExpiresAt: resolvedExpiresAt,
      planActivatedAt: activatedAt,
      activatedToken: tokenCode ?? userProfile.activatedToken,
    };
    saveSession(updated);
    setIsAccountClosedDueToExpiration(false);

    // Dispara a notificação de ativação registrando formalmente a data/hora para o usuário
    notifyPlanActivation({
      userId: userProfile.id,
      userEmail: userProfile.email,
      planName,
      activatedAt,
      expiresAt: resolvedExpiresAt,
      tokenCode,
      accumulated: stackingInfo?.accumulated,
      addedDays: stackingInfo?.addedDays,
      remainingDaysTotal: stackingInfo?.remainingDaysTotal,
    }).catch(() => {});
  };

  const signOut = async () => {
    setShouldShowFirstTimeTutorial(false);
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignora
    }
    try {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    } catch {
      // Ignora
    }
    setUser(null);
    setUserProfile(null);
    refreshDeviceTrial();
  };

  const currentRole: UserRole = userProfile?.role || 'user';
  const isAdmin = currentRole === 'admin';
  const isSubscriptionExpired = countdown.expired && !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role: currentRole,
        isAdmin,
        loading,
        countdown,
        isSubscriptionExpired,
        isAccountClosedDueToExpiration,
        closeExpiredNotice,
        isFreePlanBlocked,
        freePlanBlockedDetails,
        closeFreePlanBlockedAlert,
        triggerFreePlanBlocked,
        deviceTrial,
        refreshDeviceTrial,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        switchRole,
        updateProfilePlan,
        shouldShowFirstTimeTutorial,
        completeTutorial,
        openTutorialManually,
        closeTutorialModal,
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
