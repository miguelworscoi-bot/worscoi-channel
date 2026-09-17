'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { UserNotification } from '@/types';
import { useAuth } from './AuthContext';
import {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  checkAndNotifyPlanWarning,
  checkAndNotifyPlanExpired,
  sendBonusNotification,
  createNotification,
} from '@/services/notificationService';

interface NotificationContextType {
  notifications: UserNotification[];
  unreadCount: number;
  loading: boolean;
  isOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  toggleNotifications: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  sendBonusToUser: (params: {
    targetUserId: string;
    targetUserEmail?: string;
    title: string;
    message: string;
    bonusCode?: string;
    bonusDays?: number;
  }) => Promise<void>;
  sendBroadcastNotification: (params: {
    title: string;
    message: string;
    type?: 'bonus' | 'system' | 'plan_warning';
    bonusCode?: string;
    bonusDays?: number;
    actionUrl?: string;
  }) => Promise<void>;
  activeToast: UserNotification | null;
  dismissToast: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { userProfile, isAdmin, countdown } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<UserNotification | null>(null);

  const userId = userProfile?.id || '';

  // Carrega notificações do usuário atual
  const refreshNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const list = await fetchUserNotifications(userId);
      setNotifications(list);
    } catch {
      // Ignora erro
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Se o usuário é novo e não tem nenhuma notificação, adiciona um bônus de boas-vindas especial inicial
  useEffect(() => {
    if (!userId || loading) return;
    const welcomeKey = `playsports_welcome_bonus_${userId}`;
    if (typeof window !== 'undefined' && !localStorage.getItem(welcomeKey)) {
      localStorage.setItem(welcomeKey, 'true');
      createNotification({
        userId,
        userEmail: userProfile?.email,
        type: 'bonus',
        title: 'Bem-vindo ao PLAYSPORTS! 🎁',
        message: 'Você recebeu um bônus de boas-vindas! Acesse transmissões esportivas e canais de TV ao vivo com sinal estabilizado.',
        actionLabel: 'Começar a Assistir',
      }).then(() => {
        refreshNotifications();
      });
    }
  }, [userId, loading, userProfile?.email, refreshNotifications]);

  // Monitora validade do plano para disparar alertas automáticos de final de plano ou plano expirado
  useEffect(() => {
    if (!userId || isAdmin || !userProfile?.planExpiresAt) return;

    const expiresAt = userProfile.planExpiresAt;
    const planName = userProfile.planName || 'Plano';

    // 1. Alerta de Fim de Plano (quando faltam menos de 24h)
    checkAndNotifyPlanWarning({
      userId,
      userEmail: userProfile.email,
      planName,
      expiresAt,
    }).then((warnNotif) => {
      if (warnNotif) {
        setNotifications((prev) => [warnNotif, ...prev.filter((n) => n.id !== warnNotif.id)]);
        setActiveToast(warnNotif);
      }
    });

    // 2. Notificação de Plano Expirado (quando expira)
    if (countdown.expired) {
      checkAndNotifyPlanExpired({
        userId,
        userEmail: userProfile.email,
        planName,
        expiresAt,
      }).then((expNotif) => {
        if (expNotif) {
          setNotifications((prev) => [expNotif, ...prev.filter((n) => n.id !== expNotif.id)]);
          setActiveToast(expNotif);
        }
      });
    }
  }, [userId, isAdmin, userProfile?.planExpiresAt, userProfile?.planName, userProfile?.email, countdown.expired]);

  // Escuta novos eventos de notificação em tempo real (mesma aba ou outras ações)
  useEffect(() => {
    const handleNewNotif = (e: Event) => {
      const customEvent = e as CustomEvent<UserNotification>;
      if (customEvent.detail) {
        const notif = customEvent.detail;
        if (notif.userId === userId || notif.userId === 'all') {
          setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
          setActiveToast(notif);
        }
      }
    };

    const handleUpdated = () => {
      refreshNotifications();
    };

    window.addEventListener('playsports_new_notification', handleNewNotif);
    window.addEventListener('playsports_notifications_updated', handleUpdated);

    return () => {
      window.removeEventListener('playsports_new_notification', handleNewNotif);
      window.removeEventListener('playsports_notifications_updated', handleUpdated);
    };
  }, [userId, refreshNotifications]);

  // Contagem de notificações não lidas
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await markNotificationAsRead(id, userId);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsAsRead(userId);
  };

  const removeNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotification(id, userId);
  };

  const clearAll = async () => {
    setNotifications([]);
    await clearAllNotifications(userId);
  };

  const sendBonusToUser = async (params: {
    targetUserId: string;
    targetUserEmail?: string;
    title: string;
    message: string;
    bonusCode?: string;
    bonusDays?: number;
  }) => {
    const notif = await sendBonusNotification({
      targetUserId: params.targetUserId,
      targetUserEmail: params.targetUserEmail,
      title: params.title,
      message: params.message,
      bonusCode: params.bonusCode,
      bonusDays: params.bonusDays,
    });
    if (params.targetUserId === userId) {
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const sendBroadcastNotification = async (params: {
    title: string;
    message: string;
    type?: 'bonus' | 'system' | 'plan_warning';
    bonusCode?: string;
    bonusDays?: number;
    actionUrl?: string;
  }) => {
    const notif = await createNotification({
      userId: 'all',
      type: params.type || 'system',
      title: params.title,
      message: params.message,
      bonusCode: params.bonusCode,
      bonusDays: params.bonusDays,
      actionUrl: params.actionUrl,
    });
    setNotifications((prev) => [notif, ...prev]);
    setActiveToast(notif);
  };

  const openNotifications = () => setIsOpen(true);
  const closeNotifications = () => setIsOpen(false);
  const toggleNotifications = () => setIsOpen((prev) => !prev);
  const dismissToast = () => setActiveToast(null);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        isOpen,
        openNotifications,
        closeNotifications,
        toggleNotifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        sendBonusToUser,
        sendBroadcastNotification,
        activeToast,
        dismissToast,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
}
