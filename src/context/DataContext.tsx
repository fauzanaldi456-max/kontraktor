/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  Project, RAB, SPK, ProgressReport, Deviation,
  WagePayment, Kasbon, PurchaseOrder, PurchaseRequest,
  Journal, Supplier, Subcontractor, Photo
} from '../types/erp';

// Import initial mock data
import {
  MOCK_PROJECTS, MOCK_RABS, MOCK_SPKS, MOCK_PROGRESS_REPORTS,
  MOCK_DEVIATIONS, MOCK_WAGE_PAYMENTS, MOCK_KASBON,
  MOCK_PURCHASE_ORDERS, MOCK_PURCHASE_REQUESTS, MOCK_JOURNALS,
  MOCK_SUPPLIERS, MOCK_SUBCONTRACTORS, MOCK_PHOTOS
} from '../data/mockData';

interface DataContextType {
  // Data State
  projects: Project[];
  rabs: RAB[];
  spks: SPK[];
  progressReports: ProgressReport[];
  deviations: Deviation[];
  wagePayments: WagePayment[];
  kasbons: Kasbon[];
  purchaseOrders: PurchaseOrder[];
  purchaseRequests: PurchaseRequest[];
  journals: Journal[];
  suppliers: Supplier[];
  subcontractors: Subcontractor[];
  photos: Photo[];

  // CRUD Operations
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addRAB: (rab: Omit<RAB, 'id' | 'createdAt'>) => RAB;
  updateRAB: (id: string, updates: Partial<RAB>) => void;
  deleteRAB: (id: string) => void;

  addSPK: (spk: Omit<SPK, 'id' | 'createdAt'>) => SPK;
  updateSPK: (id: string, updates: Partial<SPK>) => void;
  deleteSPK: (id: string) => void;

  addProgressReport: (report: Omit<ProgressReport, 'id'>) => ProgressReport;
  updateProgressReport: (id: string, updates: Partial<ProgressReport>) => void;
  deleteProgressReport: (id: string) => void;

  addDeviation: (deviation: Omit<Deviation, 'id' | 'requestedAt'>) => Deviation;
  updateDeviation: (id: string, updates: Partial<Deviation>) => void;
  approveDeviation: (id: string, approvedBy: string, notes?: string) => void;

  addWagePayment: (payment: Omit<WagePayment, 'id'>) => WagePayment;
  updateWagePayment: (id: string, updates: Partial<WagePayment>) => void;

  addKasbon: (kasbon: Omit<Kasbon, 'id'>) => Kasbon;
  updateKasbon: (id: string, updates: Partial<Kasbon>) => void;

  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id'>) => PurchaseOrder;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => void;

  addPurchaseRequest: (pr: Omit<PurchaseRequest, 'id'>) => PurchaseRequest;
  updatePurchaseRequest: (id: string, updates: Partial<PurchaseRequest>) => void;

  addJournal: (journal: Omit<Journal, 'id' | 'createdAt'>) => Journal;
  updateJournal: (id: string, updates: Partial<Journal>) => void;
  deleteJournal: (id: string) => void;

  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;

  addSubcontractor: (sub: Omit<Subcontractor, 'id'>) => Subcontractor;
  updateSubcontractor: (id: string, updates: Partial<Subcontractor>) => void;

  addPhoto: (photo: Omit<Photo, 'id'>) => Photo;
  deletePhoto: (id: string) => void;

  // Utility
  generateCode: (prefix: string) => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize state with mock data
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [rabs, setRabs] = useState<RAB[]>(MOCK_RABS);
  const [spks, setSpks] = useState<SPK[]>(MOCK_SPKS);
  const [progressReports, setProgressReports] = useState<ProgressReport[]>(MOCK_PROGRESS_REPORTS);
  const [deviations, setDeviations] = useState<Deviation[]>(MOCK_DEVIATIONS);
  const [wagePayments, setWagePayments] = useState<WagePayment[]>(MOCK_WAGE_PAYMENTS);
  const [kasbons, setKasbons] = useState<Kasbon[]>(MOCK_KASBON);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(MOCK_PURCHASE_REQUESTS);
  const [journals, setJournals] = useState<Journal[]>(MOCK_JOURNALS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>(MOCK_SUBCONTRACTORS);
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);

  // Counter for generating codes
  const [counters, setCounters] = useState<Record<string, number>>({
    PRJ: 4,
    RAB: 2,
    SPK: 2,
    PO: 3,
    PR: 1,
    DEV: 2,
    WAGE: 2,
    KAS: 2,
    JUR: 6,
    PHOTO: 6,
  });

  const generateCode = useCallback((prefix: string) => {
    const year = new Date().getFullYear();
    const count = (counters[prefix] || 0) + 1;
    setCounters(prev => ({ ...prev, [prefix]: count }));
    return `${prefix}-${year}-${String(count).padStart(3, '0')}`;
  }, [counters]);

  // Project CRUD
  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  // RAB CRUD
  const addRAB = useCallback((rab: Omit<RAB, 'id' | 'createdAt'>) => {
    const newRAB: RAB = {
      ...rab,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setRabs(prev => [newRAB, ...prev]);
    return newRAB;
  }, []);

  const updateRAB = useCallback((id: string, updates: Partial<RAB>) => {
    setRabs(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteRAB = useCallback((id: string) => {
    setRabs(prev => prev.filter(r => r.id !== id));
  }, []);

  // SPK CRUD
  const addSPK = useCallback((spk: Omit<SPK, 'id' | 'createdAt'>) => {
    const newSPK: SPK = {
      ...spk,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSpks(prev => [newSPK, ...prev]);
    return newSPK;
  }, []);

  const updateSPK = useCallback((id: string, updates: Partial<SPK>) => {
    setSpks(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteSPK = useCallback((id: string) => {
    setSpks(prev => prev.filter(s => s.id !== id));
  }, []);

  // Progress Report CRUD
  const addProgressReport = useCallback((report: Omit<ProgressReport, 'id'>) => {
    const newReport: ProgressReport = {
      ...report,
      id: Date.now().toString(),
    };
    setProgressReports(prev => [newReport, ...prev]);
    return newReport;
  }, []);

  const updateProgressReport = useCallback((id: string, updates: Partial<ProgressReport>) => {
    setProgressReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteProgressReport = useCallback((id: string) => {
    setProgressReports(prev => prev.filter(r => r.id !== id));
  }, []);

  // Deviation CRUD
  const addDeviation = useCallback((deviation: Omit<Deviation, 'id' | 'requestedAt'>) => {
    const newDeviation: Deviation = {
      ...deviation,
      id: Date.now().toString(),
      requestedAt: new Date().toISOString(),
    };
    setDeviations(prev => [newDeviation, ...prev]);
    return newDeviation;
  }, []);

  const updateDeviation = useCallback((id: string, updates: Partial<Deviation>) => {
    setDeviations(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const approveDeviation = useCallback((id: string, approvedBy: string, notes?: string) => {
    setDeviations(prev => prev.map(d => d.id === id ? {
      ...d,
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
      approvedNotes: notes,
    } : d));
  }, []);

  // Wage Payment CRUD
  const addWagePayment = useCallback((payment: Omit<WagePayment, 'id'>) => {
    const newPayment: WagePayment = {
      ...payment,
      id: Date.now().toString(),
    };
    setWagePayments(prev => [newPayment, ...prev]);
    return newPayment;
  }, []);

  const updateWagePayment = useCallback((id: string, updates: Partial<WagePayment>) => {
    setWagePayments(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  // Kasbon CRUD
  const addKasbon = useCallback((kasbon: Omit<Kasbon, 'id'>) => {
    const newKasbon: Kasbon = {
      ...kasbon,
      id: Date.now().toString(),
    };
    setKasbons(prev => [newKasbon, ...prev]);
    return newKasbon;
  }, []);

  const updateKasbon = useCallback((id: string, updates: Partial<Kasbon>) => {
    setKasbons(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
  }, []);

  // Purchase Order CRUD
  const addPurchaseOrder = useCallback((po: Omit<PurchaseOrder, 'id'>) => {
    const newPO: PurchaseOrder = {
      ...po,
      id: Date.now().toString(),
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
    return newPO;
  }, []);

  const updatePurchaseOrder = useCallback((id: string, updates: Partial<PurchaseOrder>) => {
    setPurchaseOrders(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  // Purchase Request CRUD
  const addPurchaseRequest = useCallback((pr: Omit<PurchaseRequest, 'id'>) => {
    const newPR: PurchaseRequest = {
      ...pr,
      id: Date.now().toString(),
    };
    setPurchaseRequests(prev => [newPR, ...prev]);
    return newPR;
  }, []);

  const updatePurchaseRequest = useCallback((id: string, updates: Partial<PurchaseRequest>) => {
    setPurchaseRequests(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  // Journal CRUD
  const addJournal = useCallback((journal: Omit<Journal, 'id' | 'createdAt'>) => {
    const newJournal: Journal = {
      ...journal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setJournals(prev => [newJournal, ...prev]);
    return newJournal;
  }, []);

  const updateJournal = useCallback((id: string, updates: Partial<Journal>) => {
    setJournals(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
  }, []);

  const deleteJournal = useCallback((id: string) => {
    setJournals(prev => prev.filter(j => j.id !== id));
  }, []);

  // Supplier CRUD
  const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    return newSupplier;
  }, []);

  const updateSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  // Subcontractor CRUD
  const addSubcontractor = useCallback((sub: Omit<Subcontractor, 'id'>) => {
    const newSub: Subcontractor = {
      ...sub,
      id: Date.now().toString(),
    };
    setSubcontractors(prev => [newSub, ...prev]);
    return newSub;
  }, []);

  const updateSubcontractor = useCallback((id: string, updates: Partial<Subcontractor>) => {
    setSubcontractors(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  // Photo CRUD
  const addPhoto = useCallback((photo: Omit<Photo, 'id'>) => {
    const newPhoto: Photo = {
      ...photo,
      id: Date.now().toString(),
    };
    setPhotos(prev => [newPhoto, ...prev]);
    return newPhoto;
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  }, []);

  const value: DataContextType = {
    projects, rabs, spks, progressReports, deviations,
    wagePayments, kasbons, purchaseOrders, purchaseRequests,
    journals, suppliers, subcontractors, photos,
    addProject, updateProject, deleteProject,
    addRAB, updateRAB, deleteRAB,
    addSPK, updateSPK, deleteSPK,
    addProgressReport, updateProgressReport, deleteProgressReport,
    addDeviation, updateDeviation, approveDeviation,
    addWagePayment, updateWagePayment,
    addKasbon, updateKasbon,
    addPurchaseOrder, updatePurchaseOrder,
    addPurchaseRequest, updatePurchaseRequest,
    addJournal, updateJournal, deleteJournal,
    addSupplier, updateSupplier,
    addSubcontractor, updateSubcontractor,
    addPhoto, deletePhoto,
    generateCode,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
