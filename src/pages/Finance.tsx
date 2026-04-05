import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, BookOpen, TrendingUp, TrendingDown, Wallet, Calendar, X, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import PermissionGuard from '../components/PermissionGuard';
import { useData } from '../context/DataContext';

const formatCurrency = (value: number) => {
  if (value >= 1000000000000) return `IDR ${(value / 1000000000000).toFixed(1)}T`;
  if (value >= 1000000000) return `IDR ${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `IDR ${(value / 1000000).toFixed(1)}Jt`;
  return `IDR ${value.toLocaleString()}`;
};

const categoryConfig: Record<string, { label: string; color: string }> = {
  termin: { label: 'Termin', color: 'text-blue-600' },
  material: { label: 'Material', color: 'text-amber-600' },
  upah: { label: 'Upah', color: 'text-purple-600' },
  operasional: { label: 'Operasional', color: 'text-gray-600' },
  other: { label: 'Lainnya', color: 'text-gray-500' },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  Paid: { label: 'Lunas', className: 'bg-green-100 text-green-800' },
  Pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
};

export default function Finance() {
  const { journals, projects, addJournal, updateJournal, deleteJournal, generateCode } = useData();
  const [activeTab, setActiveTab] = useState<'dual' | 'transactions' | 'journal'>('dual');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [journalType, setJournalType] = useState<'income' | 'expense'>('income');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'other' as 'termin' | 'material' | 'upah' | 'operasional' | 'other',
    projectId: '',
    description: '',
    amount: '',
  });

  const totalIncome = journals.filter(j => j.type === 'income').reduce((sum, j) => sum + j.amount, 0);
  const totalExpense = journals.filter(j => j.type === 'expense').reduce((sum, j) => sum + j.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  // Reset form
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'other',
      projectId: '',
      description: '',
      amount: '',
    });
  };

  // Open create modal
  const openCreateModal = (type: 'income' | 'expense') => {
    setIsEditMode(false);
    setEditingJournalId(null);
    setJournalType(type);
    resetForm();
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (journal: typeof journals[0]) => {
    setIsEditMode(true);
    setEditingJournalId(journal.id);
    setJournalType(journal.type);
    setFormData({
      date: journal.date,
      category: journal.category,
      projectId: journal.projectId || '',
      description: journal.description,
      amount: journal.amount.toString(),
    });
    setIsModalOpen(true);
  };

  // Handle save
  const handleSave = () => {
    if (!formData.description || !formData.amount) {
      alert('Deskripsi dan jumlah wajib diisi!');
      return;
    }

    if (isEditMode && editingJournalId) {
      // Update existing journal
      const project = projects.find(p => p.id === formData.projectId);
      updateJournal(editingJournalId, {
        date: formData.date,
        type: journalType,
        category: formData.category,
        projectId: formData.projectId || undefined,
        projectName: project?.name,
        description: formData.description,
        amount: parseFloat(formData.amount) || 0,
      });
    } else {
      // Create new journal
      const project = projects.find(p => p.id === formData.projectId);
      addJournal({
        code: generateCode('JUR'),
        date: formData.date,
        type: journalType,
        category: formData.category,
        projectId: formData.projectId || undefined,
        projectName: project?.name,
        description: formData.description,
        amount: parseFloat(formData.amount) || 0,
        createdBy: 'User',
      });
    }

    resetForm();
    setIsModalOpen(false);
  };

  // Handle delete
  const handleDelete = (journalId: string) => {
    setShowDeleteConfirm(journalId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteJournal(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const incomeJournals = journals.filter(j => j.type === 'income');
  const expenseJournals = journals.filter(j => j.type === 'expense');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Total Kas Masuk</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Total Kas Keluar</p>
              <p className="text-2xl font-bold text-error">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-error" />
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Net Cash Flow</p>
              <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-primary' : 'text-error'}`}>
                {formatCurrency(netCashFlow)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant">
        <button
          onClick={() => setActiveTab('dual')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'dual' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 inline mr-1" />
          Cash In / Out
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'transactions' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Transaksi
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'journal' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-1" />
          Buku Besar
        </button>
      </div>

      {/* Date Range Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-on-surface-variant">Periode:</span>
        <div className="flex rounded-lg border border-outline-variant overflow-hidden">
          <button 
            onClick={() => setDateRange('week')}
            className={`px-3 py-1.5 text-sm ${dateRange === 'week' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-low'}`}
          >
            Minggu Ini
          </button>
          <button 
            onClick={() => setDateRange('month')}
            className={`px-3 py-1.5 text-sm ${dateRange === 'month' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-low'}`}
          >
            Bulan Ini
          </button>
          <button 
            onClick={() => setDateRange('custom')}
            className={`px-3 py-1.5 text-sm ${dateRange === 'custom' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-low'}`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Custom
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <PermissionGuard module="finance" action="create">
          <div className="flex gap-2">
            <button 
              onClick={() => openCreateModal('income')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Kas Masuk
            </button>
            <button 
              onClick={() => openCreateModal('expense')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error text-white hover:bg-error/90 transition-colors"
            >
              <TrendingDown className="w-4 h-4" />
              Kas Keluar
            </button>
          </div>
        </PermissionGuard>
      </div>

      {/* Content */}
      {activeTab === 'dual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash In Column */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            <div className="p-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Cash In (Kas Masuk)</h3>
                </div>
                <span className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</span>
              </div>
            </div>
            <div className="divide-y divide-outline-variant max-h-[500px] overflow-y-auto">
              {incomeJournals.map((item) => (
                <div key={item.id} className="p-4 hover:bg-surface-container-low">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{item.description}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{item.date} • {item.projectName}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600">+{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="px-2 py-1 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="px-2 py-1 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cash Out Column */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-error" />
                  <h3 className="font-semibold text-error">Cash Out (Kas Keluar)</h3>
                </div>
                <span className="text-lg font-bold text-error">{formatCurrency(totalExpense)}</span>
              </div>
            </div>
            <div className="divide-y divide-outline-variant max-h-[500px] overflow-y-auto">
              {expenseJournals.map((item) => (
                <div key={item.id} className="p-4 hover:bg-surface-container-low">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{item.description}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{item.date} • {item.projectName}</p>
                    </div>
                    <span className="text-sm font-bold text-error">-{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="px-2 py-1 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="px-2 py-1 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'transactions' ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Kode Jurnal</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Deskripsi</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Proyek</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Kategori</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Tanggal</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface text-right">Jumlah</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {journals.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary">{item.code}</td>
                    <td className="px-6 py-4 text-sm text-on-surface font-medium flex items-center gap-2">
                      {item.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-error" />
                      )}
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{item.projectName || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${categoryConfig[item.category]?.color}`}>
                        {categoryConfig[item.category]?.label || item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{item.date}</td>
                    <td className={`px-6 py-4 text-sm font-medium text-right ${item.type === 'income' ? 'text-green-600' : 'text-error'}`}>
                      {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      <button 
                        onClick={() => openEditModal(item)}
                        className="px-2 py-1 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="px-2 py-1 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Journal Content */
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-on-surface">Buku Besar (General Ledger)</h3>
          </div>
          <div className="space-y-4">
            {journals.map((journal) => (
              <div key={journal.id} className="p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary">{journal.code}</span>
                  <span className="text-xs text-on-surface-variant">{journal.date}</span>
                </div>
                <p className="text-sm text-on-surface mb-1">{journal.description}</p>
                <p className="text-xs text-on-surface-variant mb-2">
                  {journal.projectName} | {journal.referenceType?.toUpperCase()}: {journal.referenceCode}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
                  <span className={`text-xs font-medium ${journal.type === 'income' ? 'text-green-600' : 'text-error'}`}>
                    {journal.type === 'income' ? 'Debit' : 'Kredit'}
                  </span>
                  <span className={`font-bold ${journal.type === 'income' ? 'text-green-600' : 'text-error'}`}>
                    {formatCurrency(journal.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={() => openEditModal(journal)}
                    className="px-2 py-1 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(journal.id)}
                    className="px-2 py-1 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Create Journal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {isEditMode ? 'Edit Jurnal' : (journalType === 'income' ? 'Kas Masuk' : 'Kas Keluar')}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Tanggal</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Proyek (Opsional)</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">- Pilih Proyek -</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as typeof formData.category})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="termin">Termin</option>
                  <option value="material">Material</option>
                  <option value="upah">Upah</option>
                  <option value="operasional">Operasional</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Deskripsi transaksi..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Jumlah (Rp)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0"
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
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  journalType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-error hover:bg-error/90'
                }`}
              >
                {isEditMode ? 'Simpan Perubahan' : `Simpan ${journalType === 'income' ? 'Kas Masuk' : 'Kas Keluar'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
