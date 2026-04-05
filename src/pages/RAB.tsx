import { Plus, Search, Filter, FileSpreadsheet, ChevronDown, ChevronUp, Calculator, HardHat, Truck, ChevronRight, X, Building, Pencil, Trash2, Printer, Download } from 'lucide-react';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PermissionGuard from '../components/PermissionGuard';
import { useData } from '../context/DataContext';
import { MOCK_PROJECT_ITEMS } from '../data/mockData';
import { exportToCSV, printDocument, generateRABPrintHTML } from '../utils/exportUtils';

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-800' },
  review: { label: 'Review', className: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Disetujui', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
};

const categoryConfig: Record<string, { label: string; icon: typeof Calculator; color: string }> = {
  material: { label: 'Material', icon: Calculator, color: 'text-blue-600' },
  upah: { label: 'Upah', icon: HardHat, color: 'text-amber-600' },
  operasional: { label: 'Operasional', icon: Truck, color: 'text-purple-600' },
};

const formatCurrency = (value: number) => {
  if (value >= 1000000000000) return `IDR ${(value / 1000000000000).toFixed(1)}T`;
  if (value >= 1000000000) return `IDR ${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `IDR ${(value / 1000000).toFixed(1)}Jt`;
  return `IDR ${value.toLocaleString()}`;
};

export default function RAB() {
  const { rabs, projects, addRAB, updateRAB, deleteRAB, generateCode } = useData();
  const [expandedRab, setExpandedRab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'material' | 'upah' | 'operasional'>('all');
  const [selectedVersion, setSelectedVersion] = useState<string>('V1.0');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRabId, setEditingRabId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    projectId: '',
    versionName: 'V1.0',
    items: [] as Array<{name: string; category: 'material' | 'upah' | 'operasional'; unit: string; volume: number; price: number}>,
  });

  // Reset form
  const resetForm = () => {
    setFormData({ projectId: '', versionName: 'V1.0', items: [] });
  };

  // Open create modal
  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingRabId(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (rab: typeof rabItems[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(true);
    setEditingRabId(rab.id);
    setFormData({
      projectId: rab.projectId,
      versionName: rab.versionName,
      items: [],
    });
    setIsModalOpen(true);
  };

  // Handle save
  const handleSave = () => {
    if (!formData.projectId) {
      alert('Pilih proyek terlebih dahulu!');
      return;
    }

    if (isEditMode && editingRabId) {
      // Update existing RAB
      updateRAB(editingRabId, {
        projectId: formData.projectId,
        projectName: projects.find(p => p.id === formData.projectId)?.name || '',
        versionName: formData.versionName,
      });
    } else {
      // Create new RAB
      const project = projects.find(p => p.id === formData.projectId);
      const totalMaterial = formData.items.filter(i => i.category === 'material').reduce((s, i) => s + (i.volume * i.price), 0);
      const totalUpah = formData.items.filter(i => i.category === 'upah').reduce((s, i) => s + (i.volume * i.price), 0);
      const totalOperasional = formData.items.filter(i => i.category === 'operasional').reduce((s, i) => s + (i.volume * i.price), 0);
      
      addRAB({
        code: generateCode('RAB'),
        projectId: formData.projectId,
        projectName: project?.name || '',
        version: 1,
        versionName: formData.versionName,
        items: [],
        totalMaterial,
        totalUpah,
        totalOperasional,
        grandTotal: totalMaterial + totalUpah + totalOperasional,
        status: 'draft',
        createdBy: 'System',
        isActive: true,
      });
    }

    resetForm();
    setIsModalOpen(false);
  };

  // Handle delete
  const handleDelete = (rabId: string, e: MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(rabId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteRAB(showDeleteConfirm);
      if (expandedRab === showDeleteConfirm) {
        setExpandedRab(null);
      }
      setShowDeleteConfirm(null);
    }
  };

  const toggleExpand = (rabId: string) => {
    setExpandedRab(expandedRab === rabId ? null : rabId);
  };

  const toggleItemExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Calculate totals for each RAB
  const rabItems = rabs.map(rab => {
    const items = MOCK_PROJECT_ITEMS;
    const material = items.filter(i => i.category === 'material').reduce((sum, i) => sum + i.total, 0);
    const upah = items.filter(i => i.category === 'upah').reduce((sum, i) => sum + i.total, 0);
    const operasional = items.filter(i => i.category === 'operasional').reduce((sum, i) => sum + i.total, 0);
    return { ...rab, items, material, upah, operasional };
  });

  // Pie chart data
  const selectedRab = rabItems.find(r => r.id === expandedRab);
  const pieData = selectedRab ? [
    { name: 'Material', value: selectedRab.material, color: '#3b82f6' },
    { name: 'Upah', value: selectedRab.upah, color: '#f59e0b' },
    { name: 'Operasional', value: selectedRab.operasional, color: '#8b5cf6' },
  ] : [];

  // Group items by parent for tree structure
  const getItemLevel = (code: string) => {
    const dots = code.split('.').length - 1;
    return dots;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Total RAB</p>
          <p className="text-2xl font-bold text-primary">{rabs.length}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Disetujui</p>
          <p className="text-2xl font-bold text-green-600">
            {rabs.filter(r => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Draft</p>
          <p className="text-2xl font-bold text-amber-600">
            {rabs.filter(r => r.status === 'draft').length}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Total Nilai</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(rabs.reduce((sum, r) => sum + r.grandTotal, 0))}
          </p>
        </div>
      </div>

      {/* Actions with Version Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Cari RAB..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:border-primary"
          >
            <option value="V1.0">V1.0 - Final</option>
            <option value="V0.9">V0.9 - Draft</option>
            <option value="V0.8">V0.8 - Initial</option>
          </select>
          <button 
            onClick={() => alert('Load Template')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <Filter className="w-4 h-4" />
            Load Template
          </button>
        </div>
        <PermissionGuard module="rab" action="create">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                exportToCSV(
                  rabItems.map(r => ({
                    code: r.code,
                    projectName: r.projectName,
                    versionName: r.versionName,
                    status: r.status,
                    totalMaterial: r.totalMaterial,
                    totalUpah: r.totalUpah,
                    totalOperasional: r.totalOperasional,
                    grandTotal: r.grandTotal,
                    createdBy: r.createdBy,
                    createdAt: r.createdAt,
                  })),
                  'Laporan_RAB',
                  {
                    code: 'Kode RAB',
                    projectName: 'Nama Proyek',
                    versionName: 'Versi',
                    status: 'Status',
                    totalMaterial: 'Total Material',
                    totalUpah: 'Total Upah',
                    totalOperasional: 'Total Operasional',
                    grandTotal: 'Grand Total',
                    createdBy: 'Dibuat Oleh',
                    createdAt: 'Tanggal Dibuat',
                  }
                );
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button 
              onClick={() => {
                const rab = rabItems[0]; // Print RAB pertama sebagai contoh
                if (rab) {
                  printDocument(
                    `RAB-${rab.code}`,
                    generateRABPrintHTML({
                      code: rab.code,
                      projectName: rab.projectName,
                      versionName: rab.versionName,
                      items: rab.items,
                      totalMaterial: rab.material,
                      totalUpah: rab.upah,
                      totalOperasional: rab.operasional,
                      grandTotal: rab.grandTotal,
                      createdBy: rab.createdBy,
                      createdAt: rab.createdAt,
                    })
                  );
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <PermissionGuard module="rab" action="create">
              <button 
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                + RAB Baru
              </button>
            </PermissionGuard>
          </div>
        </PermissionGuard>
      </div>

      {/* RAB List */}
      <div className="space-y-4">
        {rabItems.map((rab) => (
          <div key={rab.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            {/* Header */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors"
              onClick={() => toggleExpand(rab.id)}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">{rab.code}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[rab.status]?.className}`}>
                      {statusConfig[rab.status]?.label}
                    </span>
                    <span className="px-2 py-0.5 bg-surface-container-high rounded-full text-xs text-on-surface-variant">
                      {rab.versionName}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface mt-1">{rab.projectName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-on-surface">{formatCurrency(rab.grandTotal)}</p>
                  <p className="text-xs text-on-surface-variant">
                    Material: {formatCurrency(rab.material)} | Upah: {formatCurrency(rab.upah)} | Op: {formatCurrency(rab.operasional)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PermissionGuard module="rab" action="edit">
                    <button 
                      onClick={(e) => openEditModal(rab, e)}
                      className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary-container/30 transition-colors"
                      title="Edit RAB"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </PermissionGuard>
                  <PermissionGuard module="rab" action="delete">
                    <button 
                      onClick={(e) => handleDelete(rab.id, e)}
                      className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                      title="Hapus RAB"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </PermissionGuard>
                  {expandedRab === rab.id ? <ChevronUp className="w-5 h-5 text-on-surface-variant" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
                </div>
              </div>
            </div>

            {/* Expanded Detail */}
            {expandedRab === rab.id && (
              <div className="border-t border-outline-variant">
                {/* Two Column Layout: Tree-Grid + Summary Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  {/* Left: Tree-Grid Items */}
                  <div className="lg:col-span-2 p-4">
                    {/* Category Tabs */}
                    <div className="flex gap-2 mb-4">
                      {(['all', 'material', 'upah', 'operasional'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={(e) => { e.stopPropagation(); setActiveTab(cat); }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === cat 
                              ? 'bg-primary-container text-on-primary-container' 
                              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                          }`}
                        >
                          {cat === 'all' ? 'Semua' : categoryConfig[cat]?.label}
                        </button>
                      ))}
                    </div>

                    {/* Tree-Grid Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-surface-container-low">
                          <tr>
                            <th className="px-4 py-2 text-xs font-medium text-on-surface-variant">Item Pekerjaan</th>
                            <th className="px-4 py-2 text-xs font-medium text-on-surface-variant">Tipe</th>
                            <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Volume</th>
                            <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Sat</th>
                            <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Harga</th>
                            <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {rab.items
                            .filter(item => activeTab === 'all' || item.category === activeTab)
                            .map((item) => {
                              const CategoryIcon = categoryConfig[item.category]?.icon || Calculator;
                              const level = getItemLevel(item.code);
                              const paddingLeft = level * 20;
                              const hasChildren = rab.items.some(i => i.parentId === item.id);
                              
                              return (
                                <tr key={item.id} className="hover:bg-surface-container-lowest">
                                  <td className="px-4 py-3" style={{ paddingLeft: `${24 + paddingLeft}px` }}>
                                    <div className="flex items-center gap-2">
                                      {hasChildren && (
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); toggleItemExpand(item.id); }}
                                          className="p-0.5 rounded hover:bg-surface-container-high"
                                        >
                                          <ChevronRight className={`w-3 h-3 text-on-surface-variant transition-transform ${expandedItems.has(item.id) ? 'rotate-90' : ''}`} />
                                        </button>
                                      )}
                                      <span className="text-sm font-medium text-on-surface">{item.code}</span>
                                      <span className="text-sm text-on-surface">{item.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 text-xs ${categoryConfig[item.category]?.color}`}>
                                      <CategoryIcon className="w-3 h-3" />
                                      {categoryConfig[item.category]?.label}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-on-surface text-right">{item.volume}</td>
                                  <td className="px-4 py-3 text-sm text-on-surface-variant text-right">{item.unit}</td>
                                  <td className="px-4 py-3 text-sm text-on-surface text-right">{formatCurrency(item.price)}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-on-surface text-right">{formatCurrency(item.total)}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: Summary Panel with Pie Chart */}
                  <div className="bg-surface-container-low p-4 border-l border-outline-variant">
                    <h4 className="text-sm font-semibold text-on-surface mb-4">Cost Breakdown</h4>
                    
                    {/* Pie Chart */}
                    <div className="h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2 mb-4">
                      {pieData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-on-surface">{item.name}</span>
                          </div>
                          <span className="font-medium text-on-surface">{((item.value / rab.grandTotal) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Total Summary */}
                    <div className="border-t border-outline-variant pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Material:</span>
                        <span className="font-medium text-blue-600">{formatCurrency(rab.material)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Upah:</span>
                        <span className="font-medium text-amber-600">{formatCurrency(rab.upah)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Operasional:</span>
                        <span className="font-medium text-purple-600">{formatCurrency(rab.operasional)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold border-t border-outline-variant pt-2">
                        <span className="text-on-surface">TOTAL:</span>
                        <span className="text-primary">{formatCurrency(rab.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-4 bg-surface-container-low text-xs text-on-surface-variant flex items-center justify-between border-t border-outline-variant">
                  <div>
                    <span>Dibuat: {rab.createdBy} ({new Date(rab.createdAt).toLocaleDateString('id-ID')})</span>
                    {rab.approvedBy && (
                      <span className="ml-4">Disetujui: {rab.approvedBy} ({new Date(rab.approvedAt!).toLocaleDateString('id-ID')})</span>
                    )}
                  </div>
                  <PermissionGuard module="rab" action="approve">
                    {rab.status === 'draft' && (
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-error text-on-error text-xs font-medium hover:bg-error/90">
                          Tolak
                        </button>
                        <button className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700">
                          Setujui
                        </button>
                      </div>
                    )}
                  </PermissionGuard>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create RAB Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {isEditMode ? 'Edit RAB' : 'Buat RAB Baru'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Proyek
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Pilih Proyek</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Version */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Versi RAB</label>
                <input
                  type="text"
                  value={formData.versionName}
                  onChange={(e) => setFormData({...formData, versionName: e.target.value})}
                  placeholder="V1.0"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-outline-variant">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
              >
                {isEditMode ? 'Simpan Perubahan' : 'Simpan RAB'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-on-surface mb-2">Hapus RAB?</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Tindakan ini tidak dapat dibatalkan. Semua data RAB akan dihapus permanen.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-error text-white hover:bg-error/90 transition-colors"
                >
                  Hapus RAB
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
