/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Master Data Types for ERP Kontraktor

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  clientEmail?: string;
  clientPhone?: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  contractValue: number;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: 'planning' | 'rab' | 'spk' | 'execution' | 'bast' | 'completed' | 'cancelled';
  progress: number;
  managerId: string;
  managerName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectItem {
  id: string;
  projectId: string;
  code: string;
  name: string;
  category: 'material' | 'upah' | 'operasional';
  unit: string;
  volume: number;
  price: number;
  total: number;
  parentId?: string;
  orderIndex: number;
}

export interface RAB {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  version: number;
  versionName: string;
  items: RABItem[];
  totalMaterial: number;
  totalUpah: number;
  totalOperasional: number;
  grandTotal: number;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  isActive: boolean;
}

export interface RABItem {
  id: string;
  rabId: string;
  projectItemId: string;
  itemName: string;
  category: 'material' | 'upah' | 'operasional';
  unit: string;
  volume: number;
  price: number;
  total: number;
}

export interface SPK {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  rabId: string;
  vendorId: string;
  vendorName: string;
  type: 'material' | 'service' | 'subcontractor';
  value: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  terms: SPKTerm[];
  items: SPKItem[];
  documents: Document[];
  createdBy: string;
  createdAt: string;
}

export interface SPKTerm {
  id: string;
  spkId: string;
  termNumber: number;
  percentage: number;
  amount: number;
  description: string;
  dueDate?: string;
  status: 'pending' | 'invoiced' | 'paid';
  invoiceId?: string;
}

export interface SPKItem {
  id: string;
  spkId: string;
  projectItemId: string;
  itemName: string;
  unit: string;
  volume: number;
  price: number;
  total: number;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  picName: string;
  category: string[];
  rating: number;
  performance: {
    onTimeDelivery: number;
    quality: number;
    price: number;
    service: number;
  };
  isActive: boolean;
}

export interface Subcontractor {
  id: string;
  code: string;
  name: string;
  leaderName: string;
  phone: string;
  address: string;
  specialization: string[];
  rating: number;
  isActive: boolean;
}

export interface Worker {
  id: string;
  subcontractorId: string;
  name: string;
  role: string;
  dailyWage: number;
  isActive: boolean;
}

export interface PurchaseRequest {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  requestDate: string;
  requiredDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'po_created';
  items: PRItem[];
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  totalAmount: number;
}

export interface PRItem {
  id: string;
  prId: string;
  projectItemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  estimatedPrice: number;
  total: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  prId: string;
  prCode: string;
  projectId: string;
  projectName: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  deliveryDate: string;
  status: 'draft' | 'sent' | 'partial' | 'completed' | 'cancelled';
  items: POItem[];
  totalAmount: number;
  createdBy: string;
}

export interface POItem {
  id: string;
  poId: string;
  prItemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
  deliveredQuantity: number;
}

export interface GoodsReceipt {
  id: string;
  code: string;
  poId: string;
  poCode: string;
  projectId: string;
  supplierId: string;
  supplierName: string;
  receiptDate: string;
  receivedBy: string;
  status: 'draft' | 'confirmed';
  items: GRItem[];
  totalAmount: number;
  notes?: string;
}

export interface GRItem {
  id: string;
  grId: string;
  poItemId: string;
  itemName: string;
  unit: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  notes?: string;
}

export interface ProgressReport {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  reportDate: string;
  reportedBy: string;
  weather: string;
  summary: string;
  items: ProgressItem[];
  photos: Photo[];
  overallProgress: number;
  status: 'draft' | 'submitted';
}

export interface ProgressItem {
  id: string;
  progressId: string;
  projectItemId: string;
  itemName: string;
  previousProgress: number;
  currentProgress: number;
  thisPeriodProgress: number;
  status: 'not_started' | 'preparation' | 'ongoing' | 'qc' | 'completed';
  notes?: string;
  photos?: string[];
}

export interface Photo {
  id: string;
  projectId: string;
  progressId?: string;
  url: string;
  caption?: string;
  phase: 'before' | 'during' | 'after';
  element?: string;
  location?: string;
  itemName?: string;
  takenAt: string;
  takenBy: string;
}

export interface QCChecklist {
  id: string;
  progressId: string;
  projectItemId: string;
  itemName: string;
  checklistDate: string;
  checkedBy: string;
  items: QCItem[];
  overallStatus: 'pass' | 'fail' | 'conditional';
  notes?: string;
  ktkItems?: KTKItem[];
}

export interface QCItem {
  id: string;
  checklistId: string;
  description: string;
  standard: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
}

export interface KTKItem {
  id: string;
  checklistId: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

export interface Deviation {
  id: string;
  code: string;
  projectId: string;
  spkId: string;
  spkCode: string;
  projectItemId: string;
  itemName: string;
  type: 'addition' | 'reduction';
  spkVolume: number;
  realizedVolume: number;
  deviationVolume: number;
  unitPrice: number;
  deviationAmount: number;
  reason: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  approvedNotes?: string;
}

export interface WagePayment {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  subcontractorId: string;
  subcontractorName: string;
  periodStart: string;
  periodEnd: string;
  workers: WageWorker[];
  totalWorkers: number;
  totalAmount: number;
  deductions: number;
  netAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'paid';
  paidAt?: string;
  paidBy?: string;
}

export interface WageWorker {
  id: string;
  wagePaymentId: string;
  workerId: string;
  workerName: string;
  daysWorked: number;
  dailyWage: number;
  totalWage: number;
  deductions: number;
  netWage: number;
}

export interface Kasbon {
  id: string;
  code: string;
  workerId: string;
  workerName: string;
  subcontractorId: string;
  amount: number;
  purpose: string;
  requestDate: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'requested' | 'approved' | 'rejected' | 'repaid';
  repayments: KasbonRepayment[];
  remainingAmount: number;
}

export interface KasbonRepayment {
  id: string;
  kasbonId: string;
  amount: number;
  repaymentDate: string;
  wagePaymentId?: string;
  notes?: string;
}

export interface Journal {
  id: string;
  code: string;
  date: string;
  type: 'income' | 'expense';
  category: 'termin' | 'material' | 'upah' | 'operasional' | 'other';
  projectId?: string;
  projectName?: string;
  description: string;
  amount: number;
  referenceType?: 'spk' | 'po' | 'wage' | 'invoice';
  referenceId?: string;
  referenceCode?: string;
  createdBy: string;
  createdAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  type: 'contract' | 'spk' | 'addendum' | 'invoice' | 'receipt' | 'other';
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject';
  entityType: string;
  entityId: string;
  entityCode?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ipAddress?: string;
}
