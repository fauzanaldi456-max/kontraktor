import { Plus, Search, Filter, Camera, CheckCircle, Clock, AlertCircle, X, Building, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import PermissionGuard from '../components/PermissionGuard';
import PhotoGallery from '../components/PhotoGallery';
import { useData } from '../context/DataContext';
import { MOCK_PHOTOS, MOCK_PROJECTS } from '../data/mockData';

const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
  not_started: { label: 'Belum Mulai', className: 'bg-gray-100 text-gray-800', icon: Clock },
  preparation: { label: 'Persiapan', className: 'bg-amber-100 text-amber-800', icon: Clock },
  ongoing: { label: 'Berjalan', className: 'bg-blue-100 text-blue-800', icon: Clock },
  qc: { label: 'QC/KTK', className: 'bg-purple-100 text-purple-800', icon: AlertCircle },
  completed: { label: 'Selesai', className: 'bg-green-100 text-green-800', icon: CheckCircle },
};

export default function FieldProgress() {
  const { progressReports, projects, addProgressReport, updateProgressReport, deleteProgressReport, generateCode } = useData();
  const [activeTab, setActiveTab] = useState<'reports' | 'photos'>('reports');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    projectId: '',
    reportDate: new Date().toISOString().split('T')[0],
    summary: '',
    overallProgress: '',
    photos: [] as string[],
  });
  const [photoError, setPhotoError] = useState('');

  // Reset form
  const resetForm = () => {
    setFormData({
      projectId: '',
      reportDate: new Date().toISOString().split('T')[0],
      summary: '',
      overallProgress: '',
      photos: [],
    });
    setPhotoError('');
  };

  // Open create modal
  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingReportId(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (report: typeof progressReports[0], e: MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(true);
    setEditingReportId(report.id);
    setFormData({
      projectId: report.projectId,
      reportDate: report.reportDate,
      summary: report.summary,
      overallProgress: report.overallProgress.toString(),
      photos: report.photos || [],
    });
    setPhotoError('');
    setIsModalOpen(true);
  };

  // Handle save dengan validasi foto mandatory
  const handleSave = () => {
    if (!formData.projectId || !formData.summary) {
      alert('Proyek dan ringkasan wajib diisi!');
      return;
    }

    // Validasi mandatory foto (minimal 3 foto)
    if (!isEditMode && formData.photos.length < 3) {
      setPhotoError(`Wajib upload minimal 3 foto (sebelum, proses, sesudah). Saat ini: ${formData.photos.length} foto.`);
      return;
    }

    if (isEditMode && editingReportId) {
      // Update existing report
      updateProgressReport(editingReportId, {
        projectId: formData.projectId,
        projectName: projects.find(p => p.id === formData.projectId)?.name || '',
        reportDate: formData.reportDate,
        summary: formData.summary,
        overallProgress: parseInt(formData.overallProgress) || 0,
        photos: formData.photos,
      });
    } else {
      // Create new report
      const project = projects.find(p => p.id === formData.projectId);
      addProgressReport({
        code: generateCode('RPT'),
        projectId: formData.projectId,
        projectName: project?.name || '',
        reportDate: formData.reportDate,
        reportedBy: 'User',
        weather: 'Cerah',
        summary: formData.summary,
        items: [],
        photos: formData.photos,
        overallProgress: parseInt(formData.overallProgress) || 0,
        status: 'draft',
      });
    }

    resetForm();
    setIsModalOpen(false);
  };

  // Handle delete
  const handleDelete = (reportId: string, e: MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(reportId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteProgressReport(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const filteredReports = selectedProject === 'all' 
    ? progressReports 
    : progressReports.filter(r => r.projectId === selectedProject);

  const filteredPhotos = selectedProject === 'all'
    ? MOCK_PHOTOS
    : MOCK_PHOTOS.filter(p => p.projectId === selectedProject);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Laporan</p>
          <p className="text-2xl font-bold text-primary">{progressReports.length}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Foto</p>
          <p className="text-2xl font-bold text-primary">{MOCK_PHOTOS.length}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Selesai</p>
          <p className="text-2xl font-bold text-green-600">
            {progressReports.filter(r => r.overallProgress === 100).length}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Berjalan</p>
          <p className="text-2xl font-bold text-blue-600">
            {progressReports.filter(r => r.overallProgress > 0 && r.overallProgress < 100).length}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">QC Pending</p>
          <p className="text-2xl font-bold text-purple-600">0</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Cari laporan..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">Semua Proyek</option>
            {MOCK_PROJECTS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <PermissionGuard module="progress" action="create">
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lapor Progress
          </button>
        </PermissionGuard>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'reports' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Laporan Progress
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'photos' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Galeri Foto
        </button>
      </div>

      {/* Content */}
      {activeTab === 'reports' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
              <div className="h-40 bg-surface-container-high relative">
                <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
                  <Camera className="w-8 h-8 opacity-50" />
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.overallProgress === 100 ? 'bg-green-100 text-green-800' :
                    report.overallProgress > 50 ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {report.overallProgress === 100 ? 'Selesai' : report.overallProgress > 50 ? 'Berjalan' : 'Dimulai'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-headline font-semibold text-on-surface line-clamp-1">{report.code}</h3>
                  <div className="flex items-center gap-1">
                    <PermissionGuard module="progress" action="edit">
                      <button 
                        onClick={(e) => openEditModal(report, e)}
                        className="p-1.5 rounded text-on-surface-variant hover:text-primary hover:bg-primary-container/30 transition-colors"
                        title="Edit Laporan"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </PermissionGuard>
                    <PermissionGuard module="progress" action="delete">
                      <button 
                        onClick={(e) => handleDelete(report.id, e)}
                        className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                        title="Hapus Laporan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </PermissionGuard>
                    <span className="text-xs text-on-surface-variant ml-2">{report.reportDate}</span>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant mb-4 line-clamp-1">{report.projectName}</p>
                <p className="text-sm text-on-surface mb-3 line-clamp-2">{report.summary}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">Progress Keseluruhan</span>
                    <span className="font-medium text-on-surface">{report.overallProgress}%</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${report.overallProgress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">
                    {report.reportedBy.charAt(0)}
                  </div>
                  <span>{report.reportedBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <PhotoGallery photos={filteredPhotos} />
      )}

      {/* Create Progress Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {isEditMode ? 'Edit Laporan Progress' : 'Laporan Progress Baru'}
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
                <label className="block text-sm font-medium text-on-surface mb-2">Tanggal Laporan</label>
                <input
                  type="date"
                  value={formData.reportDate}
                  onChange={(e) => setFormData({...formData, reportDate: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Progress Keseluruhan (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.overallProgress}
                  onChange={(e) => setFormData({...formData, overallProgress: e.target.value})}
                  placeholder="0-100"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Ringkasan Pekerjaan</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  placeholder="Deskripsi pekerjaan yang dilakukan..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Photo Upload Section - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  <Camera className="w-4 h-4 inline mr-1" />
                  Upload Foto (Wajib minimal 3: Sebelum, Proses, Sesudah)
                </label>
                
                {/* Photo Preview Grid */}
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square bg-surface-container-high rounded-lg overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant text-xs">
                          Foto {index + 1}
                        </div>
                        <button
                          onClick={() => setFormData({...formData, photos: formData.photos.filter((_, i) => i !== index)})}
                          className="absolute top-1 right-1 p-1 rounded-full bg-error text-white text-xs hover:bg-error/90"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload Button */}
                <button
                  onClick={() => {
                    // Simulasi upload foto - dalam implementasi nyata ini akan membuka file picker
                    const newPhoto = `photo_${Date.now()}_${formData.photos.length + 1}.jpg`;
                    setFormData({...formData, photos: [...formData.photos, newPhoto]});
                    setPhotoError('');
                  }}
                  className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary-container/10 transition-colors text-on-surface-variant"
                >
                  <Camera className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Klik untuk upload foto</span>
                </button>
                
                {/* Error Message */}
                {photoError && (
                  <p className="mt-2 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {photoError}
                  </p>
                )}
                
                {/* Photo Count Indicator */}
                <p className={`mt-2 text-xs ${formData.photos.length >= 3 ? 'text-green-600' : 'text-amber-600'}`}>
                  {formData.photos.length} dari 3 foto diupload {formData.photos.length >= 3 ? '(OK)' : '(minimal 3 foto wajib)'}
                </p>
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
                {isEditMode ? 'Simpan Perubahan' : 'Simpan Laporan'}
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
              <h3 className="text-lg font-semibold text-on-surface mb-2">Hapus Laporan?</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Tindakan ini tidak dapat dibatalkan. Semua data laporan akan dihapus permanen.
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
                  Hapus Laporan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
