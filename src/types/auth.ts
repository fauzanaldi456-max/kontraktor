/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'owner' | 'project_manager' | 'admin_keuangan' | 'supervisor_lapangan' | 'purchasing' | 'tukang';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve?: boolean;
}

export type ModulePermission = {
  [key: string]: Permission;
};

export const ROLE_PERMISSIONS: Record<UserRole, ModulePermission> = {
  owner: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    projects: { view: true, create: true, edit: true, delete: true },
    rab: { view: true, create: true, edit: true, delete: true, approve: true },
    admin: { view: true, create: true, edit: true, delete: true, approve: true },
    progress: { view: true, create: false, edit: false, delete: false },
    realization: { view: true, create: false, edit: false, delete: false },
    wages: { view: true, create: false, edit: false, delete: false },
    procurement: { view: true, create: true, edit: true, delete: true },
    finance: { view: true, create: true, edit: true, delete: true, approve: true },
  },
  project_manager: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    projects: { view: true, create: true, edit: true, delete: false },
    rab: { view: true, create: true, edit: true, delete: false, approve: true },
    admin: { view: true, create: true, edit: true, delete: false, approve: true },
    progress: { view: true, create: false, edit: false, delete: false },
    realization: { view: true, create: false, edit: false, delete: false },
    wages: { view: true, create: false, edit: false, delete: false },
    procurement: { view: true, create: true, edit: true, delete: false },
    finance: { view: true, create: false, edit: false, delete: false },
  },
  admin_keuangan: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    projects: { view: true, create: false, edit: false, delete: false },
    rab: { view: true, create: false, edit: false, delete: false },
    admin: { view: true, create: false, edit: false, delete: false },
    progress: { view: true, create: false, edit: false, delete: false },
    realization: { view: true, create: false, edit: false, delete: false },
    wages: { view: true, create: true, edit: true, delete: false, approve: true },
    procurement: { view: true, create: false, edit: false, delete: false },
    finance: { view: true, create: true, edit: true, delete: false, approve: true },
  },
  supervisor_lapangan: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    projects: { view: true, create: false, edit: false, delete: false },
    rab: { view: true, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    progress: { view: true, create: true, edit: true, delete: false },
    realization: { view: true, create: false, edit: false, delete: false },
    wages: { view: true, create: false, edit: false, delete: false },
    procurement: { view: false, create: false, edit: false, delete: false },
    finance: { view: false, create: false, edit: false, delete: false },
  },
  purchasing: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    projects: { view: true, create: false, edit: false, delete: false },
    rab: { view: true, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    progress: { view: false, create: false, edit: false, delete: false },
    realization: { view: false, create: false, edit: false, delete: false },
    wages: { view: false, create: false, edit: false, delete: false },
    procurement: { view: true, create: true, edit: true, delete: false },
    finance: { view: false, create: false, edit: false, delete: false },
  },
  tukang: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    projects: { view: false, create: false, edit: false, delete: false },
    rab: { view: false, create: false, edit: false, delete: false },
    admin: { view: true, create: false, edit: false, delete: false },
    progress: { view: false, create: false, edit: false, delete: false },
    realization: { view: false, create: false, edit: false, delete: false },
    wages: { view: true, create: false, edit: false, delete: false },
    procurement: { view: false, create: false, edit: false, delete: false },
    finance: { view: false, create: false, edit: false, delete: false },
  },
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  owner: 'Owner',
  project_manager: 'Project Manager',
  admin_keuangan: 'Admin Keuangan',
  supervisor_lapangan: 'Supervisor Lapangan',
  purchasing: 'Purchasing',
  tukang: 'Tukang',
};

export const ROLE_NAVIGATION_ACCESS: Record<UserRole, string[]> = {
  owner: ['/', '/projects', '/rab', '/admin', '/progress', '/realization', '/wages', '/procurement', '/finance'],
  project_manager: ['/', '/projects', '/rab', '/admin', '/progress', '/realization', '/wages', '/procurement', '/finance'],
  admin_keuangan: ['/', '/projects', '/rab', '/admin', '/progress', '/realization', '/wages', '/procurement', '/finance'],
  supervisor_lapangan: ['/', '/projects', '/rab', '/progress', '/realization', '/wages'],
  purchasing: ['/', '/projects', '/rab', '/procurement'],
  tukang: ['/', '/admin', '/wages'],
};

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Budi Santoso', email: 'owner@erp.com', role: 'owner', avatar: 'BS' },
  { id: '2', name: 'Andi Wijaya', email: 'pm@erp.com', role: 'project_manager', avatar: 'AW' },
  { id: '3', name: 'Siti Aminah', email: 'finance@erp.com', role: 'admin_keuangan', avatar: 'SA' },
  { id: '4', name: 'Joko Santoso', email: 'supervisor@erp.com', role: 'supervisor_lapangan', avatar: 'JS' },
  { id: '5', name: 'Hendra Wijaya', email: 'purchasing@erp.com', role: 'purchasing', avatar: 'HW' },
  { id: '6', name: 'Ahmad Tukang', email: 'tukang@erp.com', role: 'tukang', avatar: 'AT' },
];
