import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, safeFirestoreCall } from '@/lib/firebase';
import { UserNotification } from '@/types';

const NOTIFICATIONS_COLLECTION = 'notifications';
const LOCAL_STORAGE_PREFIX = 'playsports_notifications_';
const NOTIFIED_CYCLES_KEY = 'playsports_notified_cycles_';

/**
 * Formata data de forma amigável em português: ex: "17 de setembro de 2026 às 14:30"
 */
export function formatFriendlyDateTime(isoString?: string | null): string {
  if (!isoString) return 'Data não informada';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Retorna chave de cache local para as notificações do usuário
 */
function getStorageKey(userId: string): string {
  return `${LOCAL_STORAGE_PREFIX}${userId || 'guest'}`;
}

/**
 * Recupera notificações salvas no LocalStorage (modo offline ou fallback veloz)
 */
function getLocalNotifications(userId: string): UserNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Persiste lista de notificações no LocalStorage
 */
function saveLocalNotifications(userId: string, notifs: UserNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(notifs.slice(0, 50)));
  } catch {
    // Silencioso em caso de quota cheia
  }
}

/**
 * Busca todas as notificações para o usuário (tanto as diretas quanto as globais 'all')
 */
export async function fetchUserNotifications(userId: string): Promise<UserNotification[]> {
  const localList = getLocalNotifications(userId);

  if (!userId) return localList;

  try {
    const result = await safeFirestoreCall(async () => {
      const colRef = collection(db, NOTIFICATIONS_COLLECTION);
      // Busca notificações enviadas diretamente ao usuário ou broadcast para 'all'
      const qUser = query(colRef, where('userId', '==', userId));
      const qAll = query(colRef, where('userId', '==', 'all'));

      const [snapUser, snapAll] = await Promise.all([
        getDocs(qUser),
        getDocs(qAll),
      ]);

      const itemsMap = new Map<string, UserNotification>();

      // Carrega locais primeiro
      localList.forEach((item) => itemsMap.set(item.id, item));

      snapUser.forEach((d) => {
        itemsMap.set(d.id, { id: d.id, ...(d.data() as Omit<UserNotification, 'id'>) });
      });
      snapAll.forEach((d) => {
        itemsMap.set(d.id, { id: d.id, ...(d.data() as Omit<UserNotification, 'id'>) });
      });

      const merged = Array.from(itemsMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      saveLocalNotifications(userId, merged);
      return merged;
    }, localList, 2500);

    return result || localList;
  } catch {
    return localList;
  }
}

/**
 * Cria uma nova notificação para um usuário específico ou para todos ('all')
 */
export async function createNotification(
  data: Omit<UserNotification, 'id' | 'createdAt' | 'read'> & {
    read?: boolean;
    createdAt?: string;
  }
): Promise<UserNotification> {
  const notifId = 'notif_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
  const now = data.createdAt || new Date().toISOString();

  const newNotif: UserNotification = {
    id: notifId,
    userId: data.userId,
    userEmail: data.userEmail,
    type: data.type,
    title: data.title,
    message: data.message,
    read: data.read ?? false,
    createdAt: now,
    activatedAt: data.activatedAt,
    expiresAt: data.expiresAt,
    planName: data.planName,
    bonusCode: data.bonusCode,
    bonusDays: data.bonusDays,
    actionUrl: data.actionUrl,
    actionLabel: data.actionLabel,
  };

  // Salva no LocalStorage imediato
  const localList = getLocalNotifications(data.userId);
  saveLocalNotifications(data.userId, [newNotif, ...localList]);

  // Persiste no Firestore em segundo plano
  try {
    await safeFirestoreCall(
      () => setDoc(doc(db, NOTIFICATIONS_COLLECTION, notifId), newNotif),
      null,
      2500
    );
  } catch {
    // Fallback local garantido
  }

  // Dispara evento CustomEvent para atualização em tempo real in-tab
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('playsports_new_notification', {
        detail: newNotif,
      })
    );
  }

  return newNotif;
}

/**
 * Marca uma notificação específica como lida
 */
export async function markNotificationAsRead(notifId: string, userId: string): Promise<void> {
  const localList = getLocalNotifications(userId);
  const updated = localList.map((n) => (n.id === notifId ? { ...n, read: true } : n));
  saveLocalNotifications(userId, updated);

  try {
    await safeFirestoreCall(
      () => updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notifId), { read: true }),
      null,
      1500
    );
  } catch {
    // Fallback local mantido
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('playsports_notifications_updated'));
  }
}

/**
 * Marca todas as notificações do usuário como lidas
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const localList = getLocalNotifications(userId);
  const updated = localList.map((n) => ({ ...n, read: true }));
  saveLocalNotifications(userId, updated);

  try {
    const unreadFirestore = localList.filter((n) => !n.read);
    await Promise.all(
      unreadFirestore.map((n) =>
        safeFirestoreCall(
          () => updateDoc(doc(db, NOTIFICATIONS_COLLECTION, n.id), { read: true }),
          null,
          1500
        )
      )
    );
  } catch {
    // Ignora
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('playsports_notifications_updated'));
  }
}

/**
 * Remove uma notificação do histórico
 */
export async function deleteNotification(notifId: string, userId: string): Promise<void> {
  const localList = getLocalNotifications(userId);
  const updated = localList.filter((n) => n.id !== notifId);
  saveLocalNotifications(userId, updated);

  try {
    await safeFirestoreCall(
      () => deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notifId)),
      null,
      1500
    );
  } catch {
    // Ignora
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('playsports_notifications_updated'));
  }
}

/**
 * Limpa todas as notificações do usuário
 */
export async function clearAllNotifications(userId: string): Promise<void> {
  const localList = getLocalNotifications(userId);
  saveLocalNotifications(userId, []);

  try {
    await Promise.all(
      localList.map((n) =>
        safeFirestoreCall(
          () => deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, n.id)),
          null,
          1500
        )
      )
    );
  } catch {
    // Ignora
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('playsports_notifications_updated'));
  }
}

/* ========================================================================= */
/* DISPARADORES AUTOMÁTICOS ESPECÍFICOS SOLICITADOS                         */
/* 1. Ativação do Plano (informa exatamente o dia que ele ativou)           */
/* 2. Alerta do Final do Plano (aviso prévio)                               */
/* 3. Fim do Plano (expirado)                                               */
/* 4. Mensagens de Bônus                                                    */
/* ========================================================================= */

/**
 * Disparador: Notificação de Ativação de Plano
 * Registra formalmente a data e hora exatas da ativação para o usuário saber o dia que ativou.
 */
export async function notifyPlanActivation(params: {
  userId: string;
  userEmail?: string;
  planName: string;
  activatedAt?: string;
  expiresAt?: string | null;
  tokenCode?: string | null;
}): Promise<UserNotification> {
  const activatedDate = params.activatedAt || new Date().toISOString();
  const formattedActivated = formatFriendlyDateTime(activatedDate);
  const formattedExpires = params.expiresAt
    ? formatFriendlyDateTime(params.expiresAt)
    : 'Acesso Ilimitado';

  const tokenText = params.tokenCode ? ` com o código ${params.tokenCode}` : '';

  return createNotification({
    userId: params.userId,
    userEmail: params.userEmail,
    type: 'activation',
    title: 'Plano Ativado com Sucesso! 🎉',
    message: `Seu ${params.planName} foi ativado em ${formattedActivated}${tokenText}. Seu sinal e canais estão liberados até ${formattedExpires}.`,
    activatedAt: activatedDate,
    expiresAt: params.expiresAt || undefined,
    planName: params.planName,
    actionLabel: 'Ver Meus Canais',
  });
}

/**
 * Verifica e dispara alerta de que o plano está próximo do fim (ex: menos de 24 horas ou menos de 2 horas).
 * Evita spam gravando um carimbo de controle por ciclo de expiração.
 */
export async function checkAndNotifyPlanWarning(params: {
  userId: string;
  userEmail?: string;
  planName?: string;
  expiresAt: string;
}): Promise<UserNotification | null> {
  if (!params.expiresAt || !params.userId) return null;

  const expiryTime = new Date(params.expiresAt).getTime();
  const now = Date.now();
  const diffMs = expiryTime - now;

  // Se já expirou ou ainda tem mais de 24 horas (86.400.000 ms), não dispara alerta prévio
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (diffMs <= 0 || diffMs > oneDayMs) return null;

  // Controle anti-duplicação por ciclo
  const cycleKey = `${NOTIFIED_CYCLES_KEY}warning_${params.userId}_${params.expiresAt}`;
  if (typeof window !== 'undefined' && localStorage.getItem(cycleKey)) {
    return null; // Já avisado neste ciclo
  }

  const hoursRemaining = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
  const formattedExpires = formatFriendlyDateTime(params.expiresAt);

  const notif = await createNotification({
    userId: params.userId,
    userEmail: params.userEmail,
    type: 'plan_warning',
    title: 'Atenção: Seu plano está chegando ao fim! ⏳',
    message: `Faltam aproximadamente ${hoursRemaining}h para o término do seu plano (vence em ${formattedExpires}). Renove ou ative um novo código para não interromper sua transmissão.`,
    expiresAt: params.expiresAt,
    planName: params.planName,
    actionLabel: 'Renovar Plano Agora',
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(cycleKey, 'true');
  }

  return notif;
}

/**
 * Verifica e dispara a notificação de fim de plano (expirado).
 * Dispara apenas uma vez por ciclo de expiração.
 */
export async function checkAndNotifyPlanExpired(params: {
  userId: string;
  userEmail?: string;
  planName?: string;
  expiresAt?: string | null;
}): Promise<UserNotification | null> {
  if (!params.userId) return null;

  const cycleKey = `${NOTIFIED_CYCLES_KEY}expired_${params.userId}_${params.expiresAt || 'zero'}`;
  if (typeof window !== 'undefined' && localStorage.getItem(cycleKey)) {
    return null; // Já notificado
  }

  const notif = await createNotification({
    userId: params.userId,
    userEmail: params.userEmail,
    type: 'plan_expired',
    title: 'Seu plano expirou 🔒',
    message: `O período de acesso do seu ${params.planName || 'plano'} chegou ao fim. Para continuar assistindo à programação esportiva e canais ao vivo, renove seu pacote ou insira um novo código de acesso.`,
    expiresAt: params.expiresAt || undefined,
    planName: params.planName,
    actionLabel: 'Ver Planos & Renovar',
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(cycleKey, 'true');
  }

  return notif;
}

/**
 * Dispara notificação de bônus para um usuário específico ou todos os assinantes
 */
export async function sendBonusNotification(params: {
  targetUserId: string;
  targetUserEmail?: string;
  title: string;
  message: string;
  bonusCode?: string;
  bonusDays?: number;
  actionLabel?: string;
}): Promise<UserNotification> {
  return createNotification({
    userId: params.targetUserId,
    userEmail: params.targetUserEmail,
    type: 'bonus',
    title: params.title || 'Você Ganhou um Bônus Especial! 🎁',
    message: params.message,
    bonusCode: params.bonusCode,
    bonusDays: params.bonusDays,
    actionLabel: params.actionLabel || (params.bonusCode ? 'Resgatar Bônus' : 'Aproveitar'),
  });
}
