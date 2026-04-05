/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuditProvider } from './context/AuditContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProjectManagement from './pages/ProjectManagement';
import RAB from './pages/RAB';
import AdminSPK from './pages/AdminSPK';
import FieldProgress from './pages/FieldProgress';
import SPKRealization from './pages/SPKRealization';
import SubcontractorWages from './pages/SubcontractorWages';
import Procurement from './pages/Procurement';
import Finance from './pages/Finance';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={
          <ProtectedRoute requiredPermission={{ module: 'dashboard', action: 'view' }}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="projects" element={
          <ProtectedRoute requiredPermission={{ module: 'projects', action: 'view' }}>
            <ProjectManagement />
          </ProtectedRoute>
        } />
        <Route path="rab" element={
          <ProtectedRoute requiredPermission={{ module: 'rab', action: 'view' }}>
            <RAB />
          </ProtectedRoute>
        } />
        <Route path="admin" element={
          <ProtectedRoute requiredPermission={{ module: 'admin', action: 'view' }}>
            <AdminSPK />
          </ProtectedRoute>
        } />
        <Route path="progress" element={
          <ProtectedRoute requiredPermission={{ module: 'progress', action: 'view' }}>
            <FieldProgress />
          </ProtectedRoute>
        } />
        <Route path="realization" element={
          <ProtectedRoute requiredPermission={{ module: 'realization', action: 'view' }}>
            <SPKRealization />
          </ProtectedRoute>
        } />
        <Route path="wages" element={
          <ProtectedRoute requiredPermission={{ module: 'wages', action: 'view' }}>
            <SubcontractorWages />
          </ProtectedRoute>
        } />
        <Route path="procurement" element={
          <ProtectedRoute requiredPermission={{ module: 'procurement', action: 'view' }}>
            <Procurement />
          </ProtectedRoute>
        } />
        <Route path="finance" element={
          <ProtectedRoute requiredPermission={{ module: 'finance', action: 'view' }}>
            <Finance />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <AuditProvider>
              <AppRoutes />
            </AuditProvider>
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
