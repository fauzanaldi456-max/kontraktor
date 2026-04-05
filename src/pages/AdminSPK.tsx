import { Plus, Search, Filter, FileText, ChevronDown, ChevronUp, Calendar, DollarSign, Upload, File, X, Building, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import PermissionGuard from '../components/PermissionGuard';
import { useData } from '../context/DataContext';

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-800' },
  active: { label: 'Aktif', className: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Selesai', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
};

const termStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-800' },
  invoiced: { label: 'Diinvoice', className: 'bg-amber-100 text-amber-800' },
  paid: { label: 'Dibayar', className: 'bg-green-100 text-green-800' },
};

const typeConfig: Record<string, { label: string; className: string }> = {
  material: { label: 'Material', className: 'bg-blue-100 text-blue-800' },
  service: { label: 'Jasa', className: 'bg-purple-100 text-purple-800' },
  subcontractor: { label: 'Subkontraktor', className: 'bg-amber-100 text-amber-800' },
};

const formatCurrency = (value: number) => {
  if (value >= 1000000000000) return `IDR ${(value / 1000000000000).toFixed(1)}T`;
  if (value >= 1000000000) return `IDR ${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `IDR ${(value / 1000000).toFixed(1)}Jt`;
  return `IDR ${value.toLocaleString()}`;
};

export default function AdminSPK() {
  const { spks, projects, rabs, subcontractors, addSPK, updateSPK, deleteSPK, generateCode } = useData();
  const [selectedSpk, setSelectedSpk] = useState<string | null>(spks[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'details' | 'documents'>('details');
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSpkId, setEditingSpkId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    projectId: '',
    vendorId: '',
    type: 'material' as 'material' | 'service' | 'subcontractor',
    value: '',
    startDate: '',
    endDate: '',
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      projectId: '',
      vendorId: '',
      type: 'material',
      value: '',
      startDate: '',
      endDate: '',
    });
  };

  // Open create modal
  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingSpkId(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (spk: typeof spks[0], e: MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(true);
    setEditingSpkId(spk.id);
    setFormData({
      projectId: spk.projectId,
      vendorId: spk.vendorId,
      type: spk.type,
      value: spk.value.toString(),
      startDate: spk.startDate || '',
      endDate: spk.endDate || '',
    });
    setIsModalOpen(true);
  };

  // Handle save
  const handleSave = () => {
    if (!formData.projectId || !formData.value) {
      alert('Proyek dan nilai kontrak wajib diisi!');
      return;
    }

    if (isEditMode && editingSpkId) {
      // Update existing SPK
      const project = projects.find(p => p.id === formData.projectId);
      const vendorName = formData.type === 'subcontractor' 
        ? subcontractors.find(s => s.id === formData.vendorId)?.name || 'Subkontraktor'
        : 'Vendor';
      
      updateSPK(editingSpkId, {
        projectId: formData.projectId,
        projectName: project?.name || '',
        vendorId: formData.vendorId || '1',
        vendorName: vendorName,
        type: formData.type,
        value: parseFloat(formData.value) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
    } else {
      // Create new SPK
      const project = projects.find(p => p.id === formData.projectId);
      const vendorName = formData.type === 'subcontractor' 
        ? subcontractors.find(s => s.id === formData.vendorId)?.name || 'Subkontraktor'
        : 'Vendor';
      
      const newSpk = addSPK({
        code: generateCode('SPK'),
        projectId: formData.projectId,
        projectName: project?.name || '',
        rabId: '',
        vendorId: formData.vendorId || '1',
        vendorName: vendorName,
        type: formData.type,
        value: parseFloat(formData.value) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: 'draft',
        terms: [],
        items: [],
        documents: [],
        createdBy: 'User',
      });
      setSelectedSpk(newSpk.id);
    }

    resetForm();
    setIsModalOpen(false);
  };

  // Handle delete
  const handleDelete = (spkId: string, e: MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(spkId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteSPK(showDeleteConfirm);
      if (selectedSpk === showDeleteConfirm) {
        setSelectedSpk(null);
      }
      setShowDeleteConfirm(null);
    }
  };

  const selectedSpkData = selectedSpk ? spks.find(s => s.id === selectedSpk) : null;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Total SPK</p>
          <p className="text-2xl font-bold text-primary">{spks.length}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Aktif</p>
          <p className="text-2xl font-bold text-blue-600">
            {spks.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Selesai</p>
          <p className="text-2xl font-bold text-green-600">
            {spks.filter(s => s.status === 'completed').length}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Draft</p>
          <p className="text-2xl font-bold text-amber-600">
            {spks.filter(s => s.status === 'draft').length}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Total Nilai</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(spks.reduce((sum, s) => sum + s.value, 0))}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Cari SPK..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <PermissionGuard module="admin" action="create">
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            + SPK Baru
          </button>
        </PermissionGuard>
      </div>

      {/* Split View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
        {/* Left: SPK List Cards */}
        <div className="lg:col-span-1 space-y-3">
          {spks.map((spk) => (
            <div 
              key={spk.id} 
              onClick={() => setSelectedSpk(spk.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                selectedSpk === spk.id 
                  ? 'bg-primary-container border-primary' 
                  : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-start gap-3">
                <FileText className={`w-8 h-8 ${selectedSpk === spk.id ? 'text-primary' : 'text-on-surface-variant'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-on-surface">{spk.code}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[spk.status]?.className}`}>
                      {statusConfig[spk.status]?.label}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface mb-1">{spk.projectName}</p>
                  <p className="text-xs text-on-surface-variant mb-2">{spk.vendorName}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">{formatCurrency(spk.value)}</p>
                    <div className="flex items-center gap-1">
                      <PermissionGuard module="admin" action="edit">
                        <button 
                          onClick={(e) => openEditModal(spk, e)}
                          className="p-1.5 rounded text-on-surface-variant hover:text-primary hover:bg-primary-container/30 transition-colors"
                          title="Edit SPK"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard module="admin" action="delete">
                        <button 
                          onClick={(e) => handleDelete(spk.id, e)}
                          className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                          title="Hapus SPK"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Detail View with Tabs */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          {selectedSpkData ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-outline-variant">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface">{selectedSpkData.code}</h2>
                    <p className="text-sm text-on-surface-variant mt-1">{selectedSpkData.projectName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedSpkData.status]?.className}`}>
                    {statusConfig[selectedSpkData.status]?.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {typeConfig[selectedSpkData.type]?.label}
                  </span>
                  <span>|</span>
                  <span>{selectedSpkData.vendorName}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-outline-variant">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'details' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Termin Pembayaran
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'documents' 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Dokumen Legal
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'details' ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-on-surface mb-4">Jadwal Termin Pembayaran</h3>
                    <table className="w-full">
                      <thead className="bg-surface-container-low">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-on-surface-variant">Termin</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-on-surface-variant">Deskripsi</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-on-surface-variant">%</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-on-surface-variant">Jumlah</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-on-surface-variant">Jatuh Tempo</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-on-surface-variant">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {selectedSpkData.terms.map((term) => (
                          <tr key={term.id}>
                            <td className="px-4 py-3 text-sm font-medium">Termin {term.termNumber}</td>
                            <td className="px-4 py-3 text-sm">{term.description}</td>
                            <td className="px-4 py-3 text-sm text-right">{term.percentage}%</td>
                            <td className="px-4 py-3 text-sm font-medium text-right">{formatCurrency(term.amount)}</td>
                            <td className="px-4 py-3 text-sm text-center">{term.dueDate}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${termStatusConfig[term.status]?.className}`}>
                                {termStatusConfig[term.status]?.label}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Drag & Drop Upload Area */}
                    <div 
                      onDragEnter={() => setIsDragging(true)}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={() => setIsDragging(false)}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                        isDragging 
                          ? 'border-primary bg-primary-container/30' 
                          : 'border-outline-variant hover:border-primary/50'
                      }`}
                    >
                      <Upload className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
                      <p className="text-sm text-on-surface mb-1">Drag & drop dokumen di sini</p>
                      <p className="text-xs text-on-surface-variant mb-3">atau</p>
                      <button className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm hover:bg-primary/90">
                        Pilih File
                      </button>
                      <p className="text-xs text-on-surface-variant mt-3">PDF, DOC, JPG (max 10MB)</p>
                    </div>

                    {/* Document List */}
                    <div>
                      <h3 className="font-semibold text-on-surface mb-3">Dokumen Terupload</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                          <div className="flex items-center gap-3">
                            <File className="w-8 h-8 text-error" />
                            <div>
                              <p className="text-sm font-medium text-on-surface">Kontrak_SPK_001.pdf</p>
                              <p className="text-xs text-on-surface-variant">2.5 MB • 15 Oct 2023</p>
                            </div>
                          </div>
                          <button className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                          <div className="flex items-center gap-3">
                            <File className="w-8 h-8 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-on-surface">Addendum_1.pdf</p>
                              <p className="text-xs text-on-surface-variant">1.2 MB • 22 Oct 2023</p>
                            </div>
                          </div>
                          <button className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-on-surface-variant mx-auto mb-3 opacity-30" />
              <p className="text-on-surface-variant">Pilih SPK untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>

      {/* Create SPK Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {isEditMode ? 'Edit SPK' : 'Buat SPK Baru'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Tipe SPK</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as typeof formData.type})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="material">Material</option>
                  <option value="service">Jasa</option>
                  <option value="subcontractor">Subkontraktor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Nilai Kontrak (Rp)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
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
                {isEditMode ? 'Simpan Perubahan' : 'Simpan SPK'}
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
              <h3 className="text-lg font-semibold text-on-surface mb-2">Hapus SPK?</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Tindakan ini tidak dapat dibatalkan. Semua data SPK akan dihapus permanen.
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
                  Hapus SPK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
