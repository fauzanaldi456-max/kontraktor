import { Plus, Search, Filter, MoreVertical, MapPin, Calendar, DollarSign, X, Building2, User, Phone, Mail, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import PermissionGuard from '../components/PermissionGuard';
import GanttChart from '../components/GanttChart';
import { useData } from '../context/DataContext';
import { MOCK_PROJECT_ITEMS } from '../data/mockData';
import type { Project } from '../types/erp';

const statusConfig: Record<string, { label: string; className: string }> = {
  planning: { label: 'Perencanaan', className: 'bg-gray-100 text-gray-800' },
  rab: { label: 'RAB', className: 'bg-amber-100 text-amber-800' },
  spk: { label: 'SPK', className: 'bg-blue-100 text-blue-800' },
  execution: { label: 'Pelaksanaan', className: 'bg-indigo-100 text-indigo-800' },
  bast: { label: 'BAST', className: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Selesai', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
};

const formatCurrency = (value: number) => {
  if (value >= 1000000000000) return `IDR ${(value / 1000000000000).toFixed(1)}T`;
  if (value >= 1000000000) return `IDR ${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `IDR ${(value / 1000000).toFixed(1)}Jt`;
  return `IDR ${value.toLocaleString()}`;
};

export default function ProjectManagement() {
  const { projects, addProject, updateProject, deleteProject, generateCode } = useData();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    client: '',
    managerName: '',
    clientPhone: '',
    clientEmail: '',
    startDate: '',
    endDate: '',
    contractValue: '',
    description: '',
  });
  
  // Reset form helper
  const resetForm = () => {
    setFormData({
      name: '', location: '', client: '', managerName: '',
      clientPhone: '', clientEmail: '', startDate: '', endDate: '',
      contractValue: '', description: '',
    });
  };

  // Open create modal
  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingProjectId(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (project: Project, e: MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(true);
    setEditingProjectId(project.id);
    setFormData({
      name: project.name,
      location: project.location,
      client: project.client,
      managerName: project.managerName,
      clientPhone: project.clientPhone || '',
      clientEmail: project.clientEmail || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      contractValue: project.contractValue.toString(),
      description: project.description || '',
    });
    setIsModalOpen(true);
  };

  // Handle save (create or update)
  const handleSave = () => {
    if (!formData.name || !formData.client || !formData.contractValue) {
      alert('Nama proyek, klien, dan nilai kontrak wajib diisi!');
      return;
    }

    if (isEditMode && editingProjectId) {
      // Update existing project
      updateProject(editingProjectId, {
        name: formData.name,
        location: formData.location,
        client: formData.client,
        managerName: formData.managerName || 'TBD',
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        startDate: formData.startDate,
        endDate: formData.endDate,
        contractValue: parseFloat(formData.contractValue) || 0,
        description: formData.description,
      });
    } else {
      // Create new project
      const newProject = addProject({
        code: generateCode('PRJ'),
        name: formData.name,
        location: formData.location,
        client: formData.client,
        managerName: formData.managerName || 'TBD',
        managerId: '1',
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        startDate: formData.startDate,
        endDate: formData.endDate,
        contractValue: parseFloat(formData.contractValue) || 0,
        description: formData.description,
        status: 'planning',
        progress: 0,
      });
      setSelectedProject(newProject.id);
    }

    resetForm();
    setIsModalOpen(false);
  };

  // Handle delete
  const handleDelete = (projectId: string, e: MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(projectId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteProject(showDeleteConfirm);
      if (selectedProject === showDeleteConfirm) {
        setSelectedProject(null);
      }
      setShowDeleteConfirm(null);
    }
  };

  const selectedProjectData = selectedProject 
    ? projects.find(p => p.id === selectedProject)
    : null;

  // Generate Gantt tasks from project items
  const ganttTasks = selectedProjectData
    ? MOCK_PROJECT_ITEMS.filter(item => item.projectId === selectedProjectData.id)
        .map((item, index) => ({
          id: item.id,
          name: item.name,
          startWeek: index * 2 + 1,
          duration: Math.ceil(Math.random() * 4) + 1,
          progress: Math.floor(Math.random() * 100),
          status: Math.random() > 0.5 ? 'ongoing' : Math.random() > 0.3 ? 'completed' : 'not_started' as 'ongoing' | 'completed' | 'not_started',
        }))
    : [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Total Proyek</p>
          <p className="text-2xl font-bold text-primary">{projects.length}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Aktif</p>
          <p className="text-2xl font-bold text-indigo-600">
            {projects.filter(p => p.status === 'execution').length}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Selesai</p>
          <p className="text-2xl font-bold text-green-600">
            {projects.filter(p => p.status === 'completed').length}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Total Nilai</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(projects.reduce((sum, p) => sum + p.contractValue, 0))}
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
              placeholder="Cari proyek..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <PermissionGuard module="projects" action="create">
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Proyek Baru
          </button>
        </PermissionGuard>
      </div>

      {/* Projects Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 text-sm font-semibold text-on-surface">Kode</th>
                <th className="px-6 py-4 text-sm font-semibold text-on-surface">Nama Proyek</th>
                <th className="px-6 py-4 text-sm font-semibold text-on-surface">Klien</th>
                <th className="px-6 py-4 text-sm font-semibold text-on-surface">Nilai</th>
                <th className="px-6 py-4 text-sm font-semibold text-on-surface">Progress</th>
                <th className="px-6 py-4 text-sm font-semibold text-on-surface">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-on-surface"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {projects.map((project) => (
                <tr 
                  key={project.id} 
                  className={`hover:bg-surface-container-lowest transition-colors cursor-pointer ${selectedProject === project.id ? 'bg-primary-container/30' : ''}`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-primary">{project.code}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-on-surface">{project.name}</p>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {project.location}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{project.client}</td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">{formatCurrency(project.contractValue)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden w-24">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-on-surface">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[project.status]?.className || 'bg-gray-100'}`}>
                      {statusConfig[project.status]?.label || project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <PermissionGuard module="projects" action="edit">
                        <button 
                          onClick={(e) => openEditModal(project, e)}
                          className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary-container/30 transition-colors"
                          title="Edit Proyek"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard module="projects" action="delete">
                        <button 
                          onClick={(e) => handleDelete(project.id, e)}
                          className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                          title="Hapus Proyek"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gantt Chart for Selected Project */}
      {selectedProjectData && (
        <GanttChart 
          tasks={ganttTasks}
          totalWeeks={12}
          projectName={selectedProjectData.name}
        />
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {isEditMode ? 'Edit Proyek' : 'Buat Proyek Baru'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Nama Proyek</label>
                <input 
                  type="text" 
                  placeholder="Masukkan nama proyek..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Lokasi
                </label>
                <input 
                  type="text" 
                  placeholder="Alamat lokasi proyek..."
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Nama Klien
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nama perusahaan klien..."
                    value={formData.client}
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Nama PIC
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nama penanggung jawab..."
                    value={formData.managerName}
                    onChange={(e) => setFormData({...formData, managerName: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telepon
                  </label>
                  <input 
                    type="tel" 
                    placeholder="Nomor telepon kontak..."
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input 
                    type="email" 
                    placeholder="Email kontak..."
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Tanggal Mulai
                  </label>
                  <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Tanggal Selesai
                  </label>
                  <input 
                    type="date" 
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Contract Value */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Nilai Kontrak
                </label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={formData.contractValue}
                  onChange={(e) => setFormData({...formData, contractValue: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Deskripsi Proyek</label>
                <textarea 
                  rows={3}
                  placeholder="Deskripsi singkat ruang lingkup proyek..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>

            {/* Footer */}
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
                {isEditMode ? 'Simpan Perubahan' : 'Buat Proyek'}
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
              <h3 className="text-lg font-semibold text-on-surface mb-2">Hapus Proyek?</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Tindakan ini tidak dapat dibatalkan. Semua data proyek akan dihapus permanen.
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
                  Hapus Proyek
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
