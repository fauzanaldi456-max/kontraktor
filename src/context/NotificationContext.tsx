/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  module: 'projects' | 'rab' | 'spk' | 'progress' | 'finance' | 'procurement' | 'wages';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'RAB Disetujui',
    message: 'RAB PRJ-001-V1 telah disetujui oleh Owner',
    type: 'success',
    module: 'rab',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 menit yang lalu
    actionUrl: '/rab',
  },
  {
    id: '2',
    title: 'Progress Update',
    message: 'Laporan progress harian dari Supervisor Lapangan siap direview',
    type: 'info',
    module: 'progress',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 jam yang lalu
    actionUrl: '/progress',
  },
  {
    id: '3',
    title: 'Termin Pembayaran Jatuh Tempo',
    message: 'Termin ke-2 SPK-001 jatuh tempo dalam 3 hari',
    type: 'warning',
    module: 'spk',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 hari yang lalu
    actionUrl: '/admin',
  },
  {
    id: '4',
    title: 'Kasbon Diajukan',
    message: 'Kasbon baru dari Tukang A sebesar Rp 500,000 menunggu persetujuan',
    type: 'info',
    module: 'wages',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 jam yang lalu
    actionUrl: '/wages',
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
