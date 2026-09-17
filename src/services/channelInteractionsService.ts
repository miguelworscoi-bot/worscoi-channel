import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  increment,
  onSnapshot,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db, safeFirestoreCall } from '@/lib/firebase';
import { LOCAL_DEVICE_ID_KEY } from './subscriptionService';

export interface ChannelComment {
  id: string;
  channelId: string;
  channelName: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  userPlan?: string | null;
  text: string;
  createdAt: string; // ISO string
  parentId?: string | null; // ID do comentário pai se for resposta
  replyToUserName?: string | null; // Nome do usuário a quem está respondendo
  replyToUserId?: string | null;
  adorosCount?: number; // Quantidade de reações 'Adoro' no comentário
  adorosBy?: string[]; // IDs dos usuários que deram adoro neste comentário
}

export interface ChannelStats {
  channelId: string;
  adorosCount: number;
  commentsCount: number;
  userHasAdorado: boolean;
}

const LOCAL_ADOROS_KEY = 'worscoi_user_adoros';
const LOCAL_STATS_CACHE = 'worscoi_channel_stats_cache';
const LOCAL_COMMENTS_CACHE = 'worscoi_channel_comments_cache';

/**
 * Normaliza o ID de qualquer canal para um slug compatível com o Firestore
 */
export function getChannelSlug(canal: { id?: string; nome?: string }): string {
  if (canal.id && canal.id.trim()) {
    return canal.id.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  }
  return (canal.nome || 'canal')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'canal_default';
}

/**
 * Normaliza o identificador único para o vídeo/transmissão selecionado no player
 * Se houver múltiplos vídeos ou streams dentro do mesmo canal, permite contagem individual por vídeo
 */
export function getVideoItemSlug(
  canal: { id?: string; nome?: string } | null,
  streamIndex: number = 0,
  activeStreamUrl?: string
): string {
  if (!canal) return 'video_default';
  const baseSlug = getChannelSlug(canal);

  // Se o link for do YouTube com videoId identificável, isola o adoro e comentários por ID do vídeo
  if (activeStreamUrl) {
    const ytMatch = activeStreamUrl.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|watch|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `${baseSlug}_yt_${ytMatch[1]}`;
    }
  }

  // Se for uma transmissão secundária/vídeo indexado
  if (streamIndex > 0) {
    return `${baseSlug}_v${streamIndex}`;
  }

  return baseSlug;
}

/**
 * Formata contadores (ex: 0, 15, 1.2K, 3.5M)
 * Começa rigorosamente em 0 para dados reais sem inflação
 */
export function formatInteractionCount(count: number): string {
  if (!count || count <= 0) return '0';
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  }
  if (count >= 1_000) {
    return (count / 1_000).toFixed(1).replace('.0', '') + 'K';
  }
  return count.toString();
}

/**
 * Formata tempo decorrido em português amigável
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 15) return 'agora mesmo';
    if (diffSec < 60) return `há ${diffSec}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `há ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `há ${diffDays}d`;
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return 'recente';
  }
}

/**
 * Identifica o usuário ou dispositivo persistente para registrar reações
 */
export function getEffectiveVisitorId(authUserId?: string | null): string {
  if (authUserId && authUserId.trim()) return authUserId.trim();
  if (typeof window === 'undefined') return 'visitor_anonymous';

  let localId = localStorage.getItem(LOCAL_DEVICE_ID_KEY);
  if (!localId) {
    localId = 'visitor_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    try {
      localStorage.setItem(LOCAL_DEVICE_ID_KEY, localId);
    } catch {
      // Storage indisponível
    }
  }
  return localId;
}

// Helpers de cache local para agilidade instantânea na UI
function getLocalAdorosSet(userId: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(`${LOCAL_ADOROS_KEY}_${userId}`);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {
    // Ignora
  }
  return new Set();
}

function saveLocalAdorosSet(userId: string, set: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_ADOROS_KEY}_${userId}`, JSON.stringify(Array.from(set)));
  } catch {
    // Ignora
  }
}

function getLocalStats(channelSlug: string): { adorosCount: number; commentsCount: number } {
  if (typeof window === 'undefined') return { adorosCount: 0, commentsCount: 0 };
  try {
    const raw = localStorage.getItem(LOCAL_STATS_CACHE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[channelSlug]) {
        return {
          adorosCount: parsed[channelSlug].adorosCount || 0,
          commentsCount: parsed[channelSlug].commentsCount || 0,
        };
      }
    }
  } catch {
    // Ignora
  }
  return { adorosCount: 0, commentsCount: 0 };
}

function saveLocalStats(channelSlug: string, stats: { adorosCount: number; commentsCount: number }) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_STATS_CACHE);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[channelSlug] = stats;
    localStorage.setItem(LOCAL_STATS_CACHE, JSON.stringify(parsed));
  } catch {
    // Ignora
  }
}

function getLocalComments(channelSlug: string): ChannelComment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_CACHE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed[channelSlug])) {
        return parsed[channelSlug];
      }
    }
  } catch {
    // Ignora
  }
  return [];
}

function saveLocalComments(channelSlug: string, comments: ChannelComment[]) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_CACHE);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[channelSlug] = comments.slice(0, 50);
    localStorage.setItem(LOCAL_COMMENTS_CACHE, JSON.stringify(parsed));
  } catch {
    // Ignora
  }
}

/**
 * Escuta em tempo real estatísticas (Adoros e Comentários) de um canal
 */
export function subscribeChannelStats(
  channelSlug: string,
  userId: string,
  onUpdate: (stats: ChannelStats) => void
): () => void {
  const localSet = getLocalAdorosSet(userId);
  const localStats = getLocalStats(channelSlug);

  // Notificação inicial assíncrona com cache local para evitar setState síncrono durante a montagem do useEffect
  if (typeof window !== 'undefined') {
    queueMicrotask(() => {
      onUpdate({
        channelId: channelSlug,
        adorosCount: localStats.adorosCount,
        commentsCount: localStats.commentsCount,
        userHasAdorado: localSet.has(channelSlug),
      });
    });
  }

  let currentAdorosCount = localStats.adorosCount;
  let currentCommentsCount = localStats.commentsCount;
  let currentUserHasAdorado = localSet.has(channelSlug);

  // 1. Snapshot da contagem geral do canal no Firestore
  const statsDocRef = doc(db, 'channel_stats', channelSlug);
  const unsubStats = onSnapshot(
    statsDocRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        currentAdorosCount = typeof data.adorosCount === 'number' ? Math.max(0, data.adorosCount) : 0;
        currentCommentsCount = typeof data.commentsCount === 'number' ? Math.max(0, data.commentsCount) : 0;
        saveLocalStats(channelSlug, {
          adorosCount: currentAdorosCount,
          commentsCount: currentCommentsCount,
        });
      } else {
        // Se ainda não existe no Firestore, é rigorosamente 0
        currentAdorosCount = 0;
        currentCommentsCount = 0;
      }
      onUpdate({
        channelId: channelSlug,
        adorosCount: currentAdorosCount,
        commentsCount: currentCommentsCount,
        userHasAdorado: currentUserHasAdorado,
      });
    },
    (_err) => {
      // Falha transitória de rede ou offline: mantém dados locais sem travar
    }
  );

  // 2. Snapshot do adoro específico deste usuário
  const likeDocId = `${channelSlug}__${userId}`;
  const likeDocRef = doc(db, 'channel_likes', likeDocId);
  const unsubLike = onSnapshot(
    likeDocRef,
    (snap) => {
      currentUserHasAdorado = snap.exists();
      const updatedSet = getLocalAdorosSet(userId);
      if (currentUserHasAdorado) {
        updatedSet.add(channelSlug);
      } else {
        updatedSet.delete(channelSlug);
      }
      saveLocalAdorosSet(userId, updatedSet);

      onUpdate({
        channelId: channelSlug,
        adorosCount: currentAdorosCount,
        commentsCount: currentCommentsCount,
        userHasAdorado: currentUserHasAdorado,
      });
    },
    (_err) => {
      // Falha transitória de rede ou offline: mantém estado local
    }
  );

  return () => {
    unsubStats();
    unsubLike();
  };
}

/**
 * Alterna o estado de Adoro (Gostei/Coração) no canal com contagem real e persistência
 */
export async function toggleChannelAdoro(
  channelSlug: string,
  channelName: string,
  userId: string
): Promise<{ userHasAdorado: boolean; adorosCount: number }> {
  const likeDocId = `${channelSlug}__${userId}`;
  const likeDocRef = doc(db, 'channel_likes', likeDocId);
  const statsDocRef = doc(db, 'channel_stats', channelSlug);

  const localSet = getLocalAdorosSet(userId);
  const currentlyAdorado = localSet.has(channelSlug);
  const willAdorar = !currentlyAdorado;

  // Atualização otimista local
  if (willAdorar) {
    localSet.add(channelSlug);
  } else {
    localSet.delete(channelSlug);
  }
  saveLocalAdorosSet(userId, localSet);

  const prevStats = getLocalStats(channelSlug);
  const newAdorosCount = Math.max(0, prevStats.adorosCount + (willAdorar ? 1 : -1));
  saveLocalStats(channelSlug, {
    adorosCount: newAdorosCount,
    commentsCount: prevStats.commentsCount,
  });

  // Persistência assíncrona no Firestore
  await safeFirestoreCall(
    async () => {
      if (willAdorar) {
        await setDoc(likeDocRef, {
          channelId: channelSlug,
          channelName,
          userId,
          createdAt: new Date().toISOString(),
        });
        await setDoc(
          statsDocRef,
          {
            channelId: channelSlug,
            channelName,
            adorosCount: increment(1),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        await deleteDoc(likeDocRef);
        await setDoc(
          statsDocRef,
          {
            channelId: channelSlug,
            channelName,
            adorosCount: increment(-1),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    },
    null,
    4000
  );

  return { userHasAdorado: willAdorar, adorosCount: newAdorosCount };
}

/**
 * Escuta comentários ao vivo de um canal em tempo real via Firestore
 */
export function subscribeChannelComments(
  channelSlug: string,
  onUpdate: (comments: ChannelComment[]) => void
): () => void {
  // Notificação inicial assíncrona a partir do cache local
  const cached = getLocalComments(channelSlug);
  if (typeof window !== 'undefined') {
    queueMicrotask(() => {
      onUpdate(cached);
    });
  }

  const commentsCol = collection(db, 'channel_comments');
  const q = query(
    commentsCol,
    where('channelId', '==', channelSlug),
    limit(60)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const fetchedComments: ChannelComment[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        fetchedComments.push({
          id: docSnap.id,
          channelId: d.channelId || channelSlug,
          channelName: d.channelName || '',
          userId: d.userId || 'anon',
          userName: d.userName || 'Assinante',
          userPhoto: d.userPhoto || null,
          userPlan: d.userPlan || null,
          text: d.text || '',
          createdAt: d.createdAt || new Date().toISOString(),
          parentId: d.parentId || null,
          replyToUserName: d.replyToUserName || null,
          replyToUserId: d.replyToUserId || null,
          adorosCount:
            typeof d.adorosCount === 'number'
              ? d.adorosCount
              : Array.isArray(d.adorosBy)
              ? d.adorosBy.length
              : 0,
          adorosBy: Array.isArray(d.adorosBy) ? d.adorosBy : [],
        });
      });

      // Ordena por data decrescente (mais recentes primeiro)
      fetchedComments.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      saveLocalComments(channelSlug, fetchedComments);
      onUpdate(fetchedComments);
    },
    (_err) => {
      // Falha transitória de rede ou offline: mantém comentários locais
    }
  );

  return unsubscribe;
}

/**
 * Envia um novo comentário real para o canal (com suporte opcional a respostas em tópicos)
 */
export async function addChannelComment(params: {
  channelSlug: string;
  channelName: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  userPlan?: string | null;
  text: string;
  parentId?: string | null;
  replyToUserName?: string | null;
  replyToUserId?: string | null;
}): Promise<ChannelComment> {
  const commentId =
    'cm_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const createdAt = new Date().toISOString();

  const newComment: ChannelComment = {
    id: commentId,
    channelId: params.channelSlug,
    channelName: params.channelName,
    userId: params.userId,
    userName: params.userName.trim() || 'Assinante Worscoi',
    userPhoto: params.userPhoto || null,
    userPlan: params.userPlan || null,
    text: params.text.trim(),
    createdAt,
    parentId: params.parentId || null,
    replyToUserName: params.replyToUserName || null,
    replyToUserId: params.replyToUserId || null,
    adorosCount: 0,
    adorosBy: [],
  };

  // Atualização otimista local
  const currentComments = getLocalComments(params.channelSlug);
  const updatedComments = [newComment, ...currentComments];
  saveLocalComments(params.channelSlug, updatedComments);

  const prevStats = getLocalStats(params.channelSlug);
  const newStats = {
    adorosCount: prevStats.adorosCount,
    commentsCount: prevStats.commentsCount + 1,
  };
  saveLocalStats(params.channelSlug, newStats);

  // Grava no Firestore
  await safeFirestoreCall(
    async () => {
      const commentDocRef = doc(db, 'channel_comments', commentId);
      const statsDocRef = doc(db, 'channel_stats', params.channelSlug);

      await setDoc(commentDocRef, newComment);
      await setDoc(
        statsDocRef,
        {
          channelId: params.channelSlug,
          channelName: params.channelName,
          commentsCount: increment(1),
          updatedAt: createdAt,
        },
        { merge: true }
      );
    },
    null,
    4000
  );

  return newComment;
}

/**
 * Alterna a reação 'Adoro' (coração) em um comentário específico entre usuários
 */
export async function toggleCommentAdoro(
  commentId: string,
  channelSlug: string,
  userId: string
): Promise<{ userHasAdorado: boolean; adorosCount: number }> {
  const currentComments = getLocalComments(channelSlug);
  const targetIndex = currentComments.findIndex((c) => c.id === commentId);

  let willAdorar = true;
  let newAdorosCount = 1;
  let updatedAdorosBy: string[] = [userId];

  if (targetIndex !== -1) {
    const comment = currentComments[targetIndex];
    const adorosBy = Array.isArray(comment.adorosBy) ? [...comment.adorosBy] : [];
    const userIndex = adorosBy.indexOf(userId);

    if (userIndex >= 0) {
      // Já havia adorado: desmarca
      adorosBy.splice(userIndex, 1);
      willAdorar = false;
    } else {
      // Adiciona o adoro
      adorosBy.push(userId);
      willAdorar = true;
    }

    newAdorosCount = adorosBy.length;
    updatedAdorosBy = adorosBy;

    const updatedComments = [...currentComments];
    updatedComments[targetIndex] = {
      ...comment,
      adorosCount: newAdorosCount,
      adorosBy: updatedAdorosBy,
    };
    saveLocalComments(channelSlug, updatedComments);
  }

  // Persiste no Firestore de forma assíncrona
  await safeFirestoreCall(
    async () => {
      const commentDocRef = doc(db, 'channel_comments', commentId);
      await setDoc(
        commentDocRef,
        {
          adorosCount: newAdorosCount,
          adorosBy: updatedAdorosBy,
        },
        { merge: true }
      );
    },
    null,
    4000
  );

  return { userHasAdorado: willAdorar, adorosCount: newAdorosCount };
}

/**
 * Remove um comentário (e quaisquer respostas vinculadas)
 */
export async function deleteChannelComment(
  commentId: string,
  channelSlug: string
): Promise<void> {
  const currentComments = getLocalComments(channelSlug);
  const idsToDelete = [
    commentId,
    ...currentComments.filter((c) => c.parentId === commentId).map((c) => c.id),
  ];

  const updatedComments = currentComments.filter((c) => !idsToDelete.includes(c.id));
  saveLocalComments(channelSlug, updatedComments);

  const prevStats = getLocalStats(channelSlug);
  saveLocalStats(channelSlug, {
    adorosCount: prevStats.adorosCount,
    commentsCount: Math.max(0, prevStats.commentsCount - idsToDelete.length),
  });

  await safeFirestoreCall(
    async () => {
      const statsDocRef = doc(db, 'channel_stats', channelSlug);
      for (const id of idsToDelete) {
        const commentDocRef = doc(db, 'channel_comments', id);
        await deleteDoc(commentDocRef);
      }
      await setDoc(
        statsDocRef,
        {
          channelId: channelSlug,
          commentsCount: increment(-idsToDelete.length),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    },
    null,
    4000
  );
}
