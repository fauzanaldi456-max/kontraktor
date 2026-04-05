/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Project, ProjectItem, RAB, SPK, Supplier, Subcontractor, PurchaseRequest, PurchaseOrder, 
  GoodsReceipt, ProgressReport, Photo, Deviation, WagePayment, Kasbon, Journal, AuditLog } from '../types/erp';

// Mock Projects
export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    code: 'PRJ-2023-001',
    name: 'Pembangunan Pabrik Kelapa Sawit',
    client: 'PT. Agro Makmur',
    clientEmail: 'contact@agromakmur.co.id',
    clientPhone: '081234567890',
    location: 'Jl. Raya Industri Km 12, Dumai, Riau',
    coordinates: { lat: 1.6655, lng: 101.4459 },
    contractValue: 12500000000,
    startDate: '2023-10-01',
    endDate: '2024-06-30',
    actualStartDate: '2023-10-05',
    status: 'execution',
    progress: 65,
    managerId: '2',
    managerName: 'Andi Wijaya',
    description: 'Pembangunan pabrik kelapa sawit dengan kapasitas 30 ton/jam',
    createdAt: '2023-09-15T00:00:00Z',
    updatedAt: '2023-10-25T00:00:00Z',
  },
  {
    id: '2',
    code: 'PRJ-2023-002',
    name: 'Instalasi Pipa Gas',
    client: 'PT. Energi Nasional',
    location: 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
    contractValue: 3200000000,
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    status: 'spk',
    progress: 10,
    managerId: '2',
    managerName: 'Andi Wijaya',
    createdAt: '2023-09-20T00:00:00Z',
    updatedAt: '2023-09-20T00:00:00Z',
  },
  {
    id: '3',
    code: 'PRJ-2023-003',
    name: 'Renovasi Gudang Logistik',
    client: 'PT. Logistik Cepat',
    location: 'Kawasan Industri Jababeka, Cikarang',
    contractValue: 850000000,
    startDate: '2023-08-01',
    endDate: '2023-10-15',
    actualStartDate: '2023-08-05',
    actualEndDate: '2023-10-10',
    status: 'completed',
    progress: 100,
    managerId: '4',
    managerName: 'Joko Santoso',
    createdAt: '2023-07-15T00:00:00Z',
    updatedAt: '2023-10-15T00:00:00Z',
  },
  {
    id: '4',
    code: 'PRJ-2023-004',
    name: 'Pembangunan Jembatan Timbang',
    client: 'Dinas Perhubungan',
    location: 'Jl. Sudirman, Pekanbaru',
    contractValue: 2100000000,
    startDate: '2023-12-01',
    endDate: '2024-05-30',
    status: 'rab',
    progress: 0,
    managerId: '4',
    managerName: 'Joko Santoso',
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2023-10-01T00:00:00Z',
  },
];

// Mock Project Items (RAB Items)
export const MOCK_PROJECT_ITEMS: ProjectItem[] = [
  // Pabrik Kelapa Sawit - Material
  { id: '1', projectId: '1', code: 'M001', name: 'Semen Portland 50kg', category: 'material', unit: 'sak', volume: 1000, price: 75000, total: 75000000, orderIndex: 1 },
  { id: '2', projectId: '1', code: 'M002', name: 'Besi Beton 12mm', category: 'material', unit: 'btg', volume: 500, price: 120000, total: 60000000, orderIndex: 2 },
  { id: '3', projectId: '1', code: 'M003', name: 'Papan Cor/Bekisting', category: 'material', unit: 'm2', volume: 200, price: 150000, total: 30000000, orderIndex: 3 },
  // Pabrik Kelapa Sawit - Upah
  { id: '4', projectId: '1', code: 'U001', name: 'Pekerjaan Persiapan', category: 'upah', unit: 'ls', volume: 1, price: 50000000, total: 50000000, orderIndex: 4 },
  { id: '5', projectId: '1', code: 'U002', name: 'Pekerjaan Pondasi', category: 'upah', unit: 'm3', volume: 150, price: 350000, total: 52500000, orderIndex: 5 },
  { id: '6', projectId: '1', code: 'U003', name: 'Pekerjaan Struktur', category: 'upah', unit: 'm3', volume: 80, price: 400000, total: 32000000, orderIndex: 6 },
  // Pabrik Kelapa Sawit - Operasional
  { id: '7', projectId: '1', code: 'O001', name: 'Sewa Alat Berat', category: 'operasional', unit: 'hari', volume: 60, price: 2500000, total: 150000000, orderIndex: 7 },
  { id: '8', projectId: '1', code: 'O002', name: 'Transportasi', category: 'operasional', unit: 'ls', volume: 1, price: 25000000, total: 25000000, orderIndex: 8 },
];

// Mock RABs
export const MOCK_RABS: RAB[] = [
  {
    id: '1',
    code: 'RAB-2023-001',
    projectId: '1',
    projectName: 'Pembangunan Pabrik Kelapa Sawit',
    version: 1,
    versionName: 'V1.0',
    items: [],
    totalMaterial: 165000000,
    totalUpah: 134500000,
    totalOperasional: 175000000,
    grandTotal: 474500000,
    status: 'approved',
    createdBy: 'Andi Wijaya',
    createdAt: '2023-09-20T00:00:00Z',
    approvedBy: 'Budi Santoso',
    approvedAt: '2023-09-25T00:00:00Z',
    isActive: true,
  },
  {
    id: '2',
    code: 'RAB-2023-002',
    projectId: '2',
    projectName: 'Instalasi Pipa Gas',
    version: 1,
    versionName: 'V1.0',
    items: [],
    totalMaterial: 800000000,
    totalUpah: 450000000,
    totalOperasional: 150000000,
    grandTotal: 1400000000,
    status: 'draft',
    createdBy: 'Andi Wijaya',
    createdAt: '2023-10-20T00:00:00Z',
    isActive: true,
  },
];

// Mock SPKs
export const MOCK_SPKS: SPK[] = [
  {
    id: '1',
    code: 'SPK-2023-10-001',
    projectId: '1',
    projectName: 'Pembangunan Pabrik Kelapa Sawit',
    rabId: '1',
    vendorId: '1',
    vendorName: 'PT. Baja Perkasa',
    type: 'material',
    value: 2500000000,
    startDate: '2023-10-15',
    endDate: '2023-12-15',
    status: 'active',
    terms: [
      { id: '1', spkId: '1', termNumber: 1, percentage: 30, amount: 750000000, description: 'DP', dueDate: '2023-10-15', status: 'paid', invoiceId: 'INV-001' },
      { id: '2', spkId: '1', termNumber: 2, percentage: 40, amount: 1000000000, description: 'Progress 50%', dueDate: '2023-11-15', status: 'invoiced' },
      { id: '3', spkId: '1', termNumber: 3, percentage: 30, amount: 750000000, description: 'BAST', dueDate: '2023-12-15', status: 'pending' },
    ],
    items: [],
    documents: [],
    createdBy: 'Andi Wijaya',
    createdAt: '2023-10-10T00:00:00Z',
  },
  {
    id: '2',
    code: 'SPK-2023-10-002',
    projectId: '2',
    projectName: 'Instalasi Pipa Gas',
    rabId: '2',
    vendorId: '2',
    vendorName: 'CV. Mandiri Teknik',
    type: 'service',
    value: 450000000,
    startDate: '2023-11-05',
    endDate: '2023-12-20',
    status: 'draft',
    terms: [
      { id: '4', spkId: '2', termNumber: 1, percentage: 50, amount: 225000000, description: 'DP', dueDate: '2023-11-05', status: 'pending' },
      { id: '5', spkId: '2', termNumber: 2, percentage: 50, amount: 225000000, description: 'BAST', dueDate: '2023-12-20', status: 'pending' },
    ],
    items: [],
    documents: [],
    createdBy: 'Andi Wijaya',
    createdAt: '2023-10-22T00:00:00Z',
  },
];

// Mock Suppliers
export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    code: 'SUP-001',
    name: 'PT. Baja Perkasa',
    address: 'Jl. Industri Raya No. 45, Cilegon, Banten',
    phone: '0254-123456',
    email: 'sales@bajaperkasa.co.id',
    picName: 'Budi Santoso',
    category: ['material', 'steel'],
    rating: 4.5,
    performance: { onTimeDelivery: 90, quality: 95, price: 85, service: 90 },
    isActive: true,
  },
  {
    id: '2',
    code: 'SUP-002',
    name: 'PT. Semen Indonesia',
    address: 'Jl. Sudirman No. 100, Jakarta',
    phone: '021-5678900',
    email: 'order@semenindonesia.com',
    picName: 'Dewi Kusuma',
    category: ['material', 'cement'],
    rating: 4.8,
    performance: { onTimeDelivery: 95, quality: 98, price: 90, service: 95 },
    isActive: true,
  },
  {
    id: '3',
    code: 'SUP-003',
    name: 'CV. Pipa Mas',
    address: 'Jl. Raya Bekasi Km 20, Bekasi',
    phone: '021-8834567',
    email: 'sales@pipamas.com',
    picName: 'Ahmad Fauzi',
    category: ['material', 'pipe'],
    rating: 4.2,
    performance: { onTimeDelivery: 85, quality: 88, price: 92, service: 85 },
    isActive: true,
  },
];

// Mock Subcontractors
export const MOCK_SUBCONTRACTORS: Subcontractor[] = [
  {
    id: '1',
    code: 'SUB-001',
    name: 'Mandor Joko',
    leaderName: 'Joko Santoso',
    phone: '081234567890',
    address: 'Jl. Mawar No. 12, Pekanbaru',
    specialization: ['pondasi', 'struktur'],
    rating: 4.7,
    isActive: true,
  },
  {
    id: '2',
    code: 'SUB-002',
    name: 'Mandor Agus',
    leaderName: 'Agus Wijaya',
    phone: '082345678901',
    address: 'Jl. Melati No. 8, Pekanbaru',
    specialization: [' finishing', 'renovasi'],
    rating: 4.5,
    isActive: true,
  },
];

// Mock Purchase Orders
export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: '1',
    code: 'PO-2023-10-001',
    prId: '1',
    prCode: 'PR-2023-10-001',
    projectId: '1',
    projectName: 'Pembangunan Pabrik Kelapa Sawit',
    supplierId: '2',
    supplierName: 'PT. Semen Indonesia',
    orderDate: '2023-10-20',
    deliveryDate: '2023-11-05',
    status: 'completed',
    items: [
      { id: '1', poId: '1', prItemId: '1', itemName: 'Semen Portland 50kg', unit: 'sak', quantity: 1000, price: 75000, total: 75000000, deliveredQuantity: 1000 },
    ],
    totalAmount: 75000000,
    createdBy: 'Hendra Wijaya',
  },
  {
    id: '2',
    code: 'PO-2023-10-002',
    prId: '2',
    prCode: 'PR-2023-10-002',
    projectId: '1',
    projectName: 'Pembangunan Pabrik Kelapa Sawit',
    supplierId: '1',
    supplierName: 'PT. Baja Perkasa',
    orderDate: '2023-10-22',
    deliveryDate: '2023-11-10',
    status: 'partial',
    items: [
      { id: '2', poId: '2', prItemId: '2', itemName: 'Besi Beton 12mm', unit: 'btg', quantity: 500, price: 120000, total: 60000000, deliveredQuantity: 300 },
    ],
    totalAmount: 60000000,
    createdBy: 'Hendra Wijaya',
  },
];

// Mock Purchase Requests
export const MOCK_PURCHASE_REQUESTS: PurchaseRequest[] = [
  {
    id: '1',
    code: 'PR-2023-10-001',
    projectId: '1',
    projectName: 'Pembangunan Pabrik Kelapa Sawit',
    requestDate: '2023-10-15',
    requiredDate: '2023-10-25',
    status: 'approved',
    items: [
      { id: '1', prId: '1', itemName: 'Semen Portland 50kg', specification: 'Semen kualitas premium', unit: 'sak', quantity: 1000, priceEstimate: 75000 },
    ],
    totalAmount: 75000000,
    requestedBy: 'Hendra Wijaya',
    approvedBy: 'Andi Wijaya',
  },
  {
    id: '2',
    code: 'PR-2023-10-002',
    projectId: '1',
    projectName: 'Pembangunan Pabrik Kelapa Sawit',
    requestDate: '2023-10-18',
    requiredDate: '2023-11-05',
    status: 'po_created',
    items: [
      { id: '2', prId: '2', itemName: 'Besi Beton 12mm', specification: 'Besi beton ulir', unit: 'btg', quantity: 500, priceEstimate: 120000 },
    ],
    totalAmount: 60000000,
    requestedBy: 'Hendra Wijaya',
    approvedBy: 'Andi Wijaya',
  },
];

// Mock Progress Reports
export const MOCK_PROGRESS_REPORTS: ProgressReport[] = [
  {
    id: '1',
    code: 'PROG-001',
    projectId: '1',
    projectName: 'Pembangunan Pabrik Kelapa Sawit',
    reportDate: '2023-10-25',
    reportedBy: 'Joko Santoso',
    weather: 'Cerah',
    summary: 'Pekerjaan pondasi Area A sudah mencapai 80%',
    items: [
      { id: '1', progressId: '1', projectItemId: '5', itemName: 'Pekerjaan Pondasi', previousProgress: 60, currentProgress: 80, thisPeriodProgress: 20, status: 'ongoing' },
    ],
    photos: [],
    overallProgress: 65,
    status: 'submitted',
  },
];

// Mock Photos
export const MOCK_PHOTOS: Photo[] = [
  { id: '1', projectId: '1', progressId: '1', url: '/photos/1.jpg', caption: 'Pondasi Area A - Hari 1', phase: 'before', element: 'Pondasi', location: 'Area A', itemName: 'Pekerjaan Pondasi', takenAt: '2023-10-20T08:00:00Z', takenBy: 'Joko Santoso' },
  { id: '2', projectId: '1', progressId: '1', url: '/photos/2.jpg', caption: 'Pondasi Area A - Progress', phase: 'during', element: 'Pondasi', location: 'Area A', itemName: 'Pekerjaan Pondasi', takenAt: '2023-10-25T14:00:00Z', takenBy: 'Joko Santoso' },
];

// Mock Deviations
export const MOCK_DEVIATIONS: Deviation[] = [
  {
    id: '1',
    code: 'DEV-2023-001',
    projectId: '1',
    spkId: '1',
    spkCode: 'SPK-2023-10-001',
    projectItemId: '2',
    itemName: 'Besi Beton 12mm',
    type: 'addition',
    spkVolume: 500,
    realizedVolume: 550,
    deviationVolume: 50,
    unitPrice: 120000,
    deviationAmount: 6000000,
    reason: 'Kebutuhan tambahan untuk area pondasi yang lebih luas',
    status: 'approved',
    requestedBy: 'Joko Santoso',
    requestedAt: '2023-11-01T00:00:00Z',
    approvedBy: 'Andi Wijaya',
    approvedAt: '2023-11-02T00:00:00Z',
    approvedNotes: 'Disetujui dengan verifikasi di lapangan',
  },
];

// Mock Wage Payments
export const MOCK_WAGE_PAYMENTS: WagePayment[] = [
  {
    id: '1',
    code: 'WAGE-2023-10-01',
    projectId: '1',
    projectName: 'Pembangunan Pabrik Kelapa Sawit',
    subcontractorId: '1',
    subcontractorName: 'Mandor Joko',
    periodStart: '2023-10-16',
    periodEnd: '2023-10-31',
    workers: [
      { id: '1', wagePaymentId: '1', workerId: '1', workerName: 'Slamet', daysWorked: 12, dailyWage: 150000, totalWage: 1800000, deductions: 0, netWage: 1800000 },
      { id: '2', wagePaymentId: '1', workerId: '2', workerName: 'Jono', daysWorked: 12, dailyWage: 150000, totalWage: 1800000, deductions: 0, netWage: 1800000 },
    ],
    totalWorkers: 15,
    totalAmount: 45000000,
    deductions: 0,
    netAmount: 45000000,
    status: 'paid',
    paidAt: '2023-11-05T00:00:00Z',
    paidBy: 'Siti Aminah',
  },
];

// Mock Kasbon
export const MOCK_KASBON: Kasbon[] = [
  {
    id: '1',
    code: 'KSB-2023-001',
    workerId: '1',
    workerName: 'Slamet',
    subcontractorId: '1',
    amount: 500000,
    purpose: 'Kebutuhan mendesak keluarga',
    requestDate: '2023-10-20',
    approvedBy: 'Mandor Joko',
    approvedAt: '2023-10-20T00:00:00Z',
    status: 'repaid',
    repayments: [
      { id: '1', kasbonId: '1', amount: 250000, repaymentDate: '2023-10-31', wagePaymentId: '1' },
      { id: '2', kasbonId: '1', amount: 250000, repaymentDate: '2023-11-15', wagePaymentId: '2' },
    ],
    remainingAmount: 0,
  },
];

// Mock Journal Entries
export const MOCK_JOURNALS: Journal[] = [
  { id: '1', code: 'JUR-2023-001', date: '2023-10-15', type: 'income', category: 'termin', projectId: '1', projectName: 'Pembangunan Pabrik Kelapa Sawit', description: 'Termin 1 - Pembangunan Pabrik', amount: 2500000000, referenceType: 'spk', referenceId: '1', referenceCode: 'SPK-2023-10-001', createdBy: 'Siti Aminah', createdAt: '2023-10-15T00:00:00Z' },
  { id: '2', code: 'JUR-2023-002', date: '2023-10-22', type: 'expense', category: 'material', projectId: '1', projectName: 'Pembangunan Pabrik Kelapa Sawit', description: 'Pembayaran Material Semen', amount: 150000000, referenceType: 'po', referenceId: '1', referenceCode: 'PO-2023-10-001', createdBy: 'Siti Aminah', createdAt: '2023-10-22T00:00:00Z' },
  { id: '3', code: 'JUR-2023-003', date: '2023-10-25', type: 'expense', category: 'upah', projectId: '1', projectName: 'Pembangunan Pabrik Kelapa Sawit', description: 'Upah Mandor Joko', amount: 45000000, referenceType: 'wage', referenceId: '1', referenceCode: 'WAGE-2023-10-01', createdBy: 'Siti Aminah', createdAt: '2023-10-25T00:00:00Z' },
];

// Mock Audit Logs
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: '1', timestamp: '2023-10-15T10:00:00Z', userId: '1', userName: 'Budi Santoso', userRole: 'owner', action: 'create', entityType: 'project', entityId: '1', entityCode: 'PRJ-2023-001' },
  { id: '2', timestamp: '2023-10-16T14:30:00Z', userId: '2', userName: 'Andi Wijaya', userRole: 'project_manager', action: 'create', entityType: 'rab', entityId: '1', entityCode: 'RAB-2023-001' },
  { id: '3', timestamp: '2023-10-20T09:15:00Z', userId: '1', userName: 'Budi Santoso', userRole: 'owner', action: 'approve', entityType: 'rab', entityId: '1', entityCode: 'RAB-2023-001' },
];
