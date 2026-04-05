/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'approve' | 'reject' | 'export' | 'print';
  module: 'projects' | 'rab' | 'spk' | 'progress' | 'finance' | 'procurement' | 'wages' | 'admin';
  entityType: string;
  entityId: string;
  entityCode?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  description: string;
  ipAddress?: string;
}

interface AuditContextType {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getLogsByModule: (module: string) => AuditLog[];
  getLogsByUser: (userId: string) => AuditLog[];
  getLogsByEntity: (entityType: string, entityId: string) => AuditLog[];
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

// Mock audit logs data
const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    userId: 'owner',
    userName: 'Bapak Owner',
    userRole: 'owner',
    action: 'approve',
    module: 'rab',
    entityType: 'RAB',
    entityId: 'rab-1',
    entityCode: 'RAB-PRJ001-V1',
    description: 'Menyetujui RAB PRJ-001-V1',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    userId: 'pm1',
    userName: 'Pak Project Manager',
    userRole: 'project_manager',
    action: 'create',
    module: 'projects',
    entityType: 'Project',
    entityId: 'proj-3',
    entityCode: 'PRJ-003',
    description: 'Membuat proyek baru: Perluasan Gudang C',
    oldValues: undefined,
    newValues: { name: 'Perluasan Gudang C', location: 'Lagoi Bay Area C', contractValue: 2500000000 },
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    userId: 'admin',
    userName: 'Bu Admin',
    userRole: 'admin',
    action: 'update',
    module: 'spk',
    entityType: 'SPK',
    entityId: 'spk-1',
    entityCode: 'SPK-001',
    description: 'Mengubah nilai kontrak SPK-001',
    oldValues: { value: 500000000 },
    newValues: { value: 550000000 },
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    userId: 'supervisor',
    userName: 'Pak Supervisor',
    userRole: 'supervisor',
    action: 'create',
    module: 'progress',
    entityType: 'ProgressReport',
    entityId: 'rpt-1',
    entityCode: 'RPT-001',
    description: 'Membuat laporan progress harian',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    userId: 'finance',
    userName: 'Pak Finance',
    userRole: 'finance',
    action: 'export',
    module: 'finance',
    entityType: 'Journal',
    entityId: 'all',
    description: 'Export laporan keuangan ke Excel',
  },
];

const actionLabels: Record<string, string> = {
  create: 'Membuat',
  update: 'Mengubah',
  delete: 'Menghapus',
  view: 'Melihat',
  approve: 'Menyetujui',
  reject: 'Menolak',
  export: 'Export',
  print: 'Print',
};

const moduleLabels: Record<string, string> = {
  projects: 'Proyek',
  rab: 'RAB',
  spk: 'SPK',
  progress: 'Progress',
  finance: 'Keuangan',
  procurement: 'Pengadaan',
  wages: 'Upah',
  admin: 'Administrasi',
};

export function AuditProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  const addLog = useCallback((log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const getLogsByModule = useCallback((module: string) => {
    return logs.filter(log => log.module === module);
  }, [logs]);

  const getLogsByUser = useCallback((userId: string) => {
    return logs.filter(log => log.userId === userId);
  }, [logs]);

  const getLogsByEntity = useCallback((entityType: string, entityId: string) => {
    return logs.filter(log => log.entityType === entityType && log.entityId === entityId);
  }, [logs]);

  return (
    <AuditContext.Provider value={{ logs, addLog, getLogsByModule, getLogsByUser, getLogsByEntity }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
}

// Helper function to format audit log for display
export function formatAuditLog(log: AuditLog): string {
  const action = actionLabels[log.action] || log.action;
  const module = moduleLabels[log.module] || log.module;
  
  if (log.entityCode) {
    return `${log.userName} (${log.userRole}) - ${action} ${log.entityType} ${log.entityCode} di ${module}`;
  }
  
  return `${log.userName} (${log.userRole}) - ${action} di ${module}`;
}
