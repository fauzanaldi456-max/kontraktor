import { Plus, Search, Filter, Users, Wallet, CreditCard, ChevronDown, ChevronUp, FileText, TrendingUp, X, Building } from 'lucide-react';
import { useState } from 'react';
import PermissionGuard from '../components/PermissionGuard';
import { useData } from '../context/DataContext';
import { MOCK_SPKS } from '../data/mockData';

const formatCurrency = (value: number) => {
  if (value >= 1000000000000) return `IDR ${(value / 1000000000000).toFixed(1)}T`;
  if (value >= 1000000000) return `IDR ${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `IDR ${(value / 1000000).toFixed(1)}Jt`;
  return `IDR ${value.toLocaleString()}`;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
  submitted: { label: 'Diajukan', className: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Disetujui', className: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Dibayar', className: 'bg-green-100 text-green-800' },
};

const kasbonStatusConfig: Record<string, { label: string; className: string }> = {
  requested: { label: 'Diajukan', className: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Disetujui', className: 'bg-blue-100 text-blue-800' },
  rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
  repaid: { label: 'Lunas', className: 'bg-green-100 text-green-800' },
};

export default function SubcontractorWages() {
  const { wagePayments, kasbons, subcontractors, projects, addWagePayment, addKasbon, generateCode } = useData();
  const [activeTab, setActiveTab] = useState<'subcontractors' | 'wages' | 'kasbon'>('subcontractors');
  const [expandedWage, setExpandedWage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'wage' | 'kasbon'>('wage');
  
  // Form states
  const [wageForm, setWageForm] = useState({
    projectId: '',
    subcontractorId: '',
    periodStart: '',
    periodEnd: '',
    totalAmount: '',
  });
  
  const [kasbonForm, setKasbonForm] = useState({
    workerName: '',
    amount: '',
    purpose: '',
  });

  const toggleExpand = (wageId: string) => {
    setExpandedWage(expandedWage === wageId ? null : wageId);
  };

  // Calculate KPIs
  const totalDealValue = MOCK_SPKS.filter(s => s.type === 'subcontractor').reduce((sum, s) => sum + s.value, 0);
  const totalPaid = wagePayments.filter(w => w.status === 'paid').reduce((sum, w) => sum + w.netAmount, 0);
  const outstandingDebt = totalDealValue - totalPaid;
  const totalKasbon = kasbons.reduce((sum, k) => sum + k.amount, 0);

  // Calculate payment completion per subcontractor
  const subconProgress = subcontractors.map(sub => {
    const dealValue = MOCK_SPKS.filter(s => s.vendorId === sub.id).reduce((sum, s) => sum + s.value, 0);
    const paid = wagePayments.filter(w => w.subcontractorId === sub.id && w.status === 'paid').reduce((sum, w) => sum + w.netAmount, 0);
    const progress = dealValue > 0 ? (paid / dealValue) * 100 : 0;
    return { ...sub, dealValue, paid, progress, remaining: dealValue - paid };
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Total Deal Value</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(totalDealValue)}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Total Paid</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Outstanding Debt</p>
            <p className="text-lg font-bold text-amber-600">{formatCurrency(outstandingDebt)}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Total Kasbon</p>
            <p className="text-lg font-bold text-error">{formatCurrency(totalKasbon)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant">
        <button
          onClick={() => setActiveTab('subcontractors')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'subcontractors' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1" />
          Daftar Subkontraktor
        </button>
        <button
          onClick={() => setActiveTab('wages')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'wages' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Pembayaran Upah
        </button>
        <button
          onClick={() => setActiveTab('kasbon')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'kasbon' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Kasbon
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder={activeTab === 'wages' ? "Cari pembayaran..." : "Cari kasbon..."}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <PermissionGuard module="wages" action="create">
          <button 
            onClick={() => { setModalType(activeTab === 'wages' ? 'wage' : 'kasbon'); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'wages' ? 'Input Upah' : 'Input Kasbon'}
          </button>
        </PermissionGuard>
      </div>

      {/* Content */}
      {activeTab === 'subcontractors' ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Subcontractor</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Pekerjaan</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface text-right">Nilai Deal</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface text-right">Terbayar</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Penyelesaian Pembayaran</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface text-right">Sisa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {subconProgress.map((sub) => (
                  <tr key={sub.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-on-surface">{sub.name}</p>
                      <p className="text-xs text-on-surface-variant">{sub.leaderName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {sub.specialization.join(', ')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface text-right">
                      {formatCurrency(sub.dealValue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right">
                      {formatCurrency(sub.paid)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${sub.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-on-surface w-12 text-right">
                          {sub.progress.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-amber-600 text-right">
                      {formatCurrency(sub.remaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'wages' ? (
        <div className="space-y-4">
          {wagePayments.map((wage) => (
            <div key={wage.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors"
                onClick={() => toggleExpand(wage.id)}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">{wage.code}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[wage.status]?.className}`}>
                      {statusConfig[wage.status]?.label}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface mt-1">{wage.subcontractorName}</p>
                  <p className="text-xs text-on-surface-variant">{wage.projectName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-on-surface">{formatCurrency(wage.netAmount)}</p>
                    <p className="text-xs text-on-surface-variant">{wage.periodStart} - {wage.periodEnd}</p>
                  </div>
                  {expandedWage === wage.id ? <ChevronUp className="w-5 h-5 text-on-surface-variant" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
                </div>
              </div>

              {expandedWage === wage.id && (
                <div className="border-t border-outline-variant p-4">
                  <table className="w-full">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-left">Pekerja</th>
                        <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Harian</th>
                        <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Hari</th>
                        <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Total</th>
                        <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Potongan</th>
                        <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Diterima</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {wage.workers.map((worker) => (
                        <tr key={worker.id}>
                          <td className="px-4 py-3 text-sm text-on-surface">{worker.workerName}</td>
                          <td className="px-4 py-3 text-sm text-on-surface text-right">{formatCurrency(worker.dailyWage)}</td>
                          <td className="px-4 py-3 text-sm text-on-surface text-right">{worker.daysWorked}</td>
                          <td className="px-4 py-3 text-sm text-on-surface text-right">{formatCurrency(worker.totalWage)}</td>
                          <td className="px-4 py-3 text-sm text-error text-right">{formatCurrency(worker.deductions)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-on-surface text-right">{formatCurrency(worker.netWage)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-surface-container-low">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-medium text-on-surface text-right">Total:</td>
                        <td className="px-4 py-3 text-sm font-medium text-on-surface text-right">{formatCurrency(wage.totalAmount)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-error text-right">{formatCurrency(wage.deductions)}</td>
                        <td className="px-4 py-3 text-sm font-bold text-primary text-right">{formatCurrency(wage.netAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Kasbon Content */
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Kode</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Pekerja</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Tujuan</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface text-right">Jumlah</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface text-right">Sisa</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Tanggal</th>
                  <th className="px-6 py-4 text-sm font-semibold text-on-surface">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {kasbons.map((kasbon) => (
                  <tr key={kasbon.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary">{kasbon.code}</td>
                    <td className="px-6 py-4 text-sm text-on-surface">{kasbon.workerName}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{kasbon.purpose}</td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface text-right">{formatCurrency(kasbon.amount)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-error text-right">{formatCurrency(kasbon.remainingAmount)}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{kasbon.requestDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${kasbonStatusConfig[kasbon.status]?.className}`}>
                        {kasbonStatusConfig[kasbon.status]?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Wage/Kasbon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {modalType === 'wage' ? 'Input Pembayaran Upah' : 'Input Kasbon'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalType === 'wage' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">
                      <Building className="w-4 h-4 inline mr-1" />
                      Proyek
                    </label>
                    <select
                      value={wageForm.projectId}
                      onChange={(e) => setWageForm({...wageForm, projectId: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Pilih Proyek</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Subkontraktor</label>
                    <select
                      value={wageForm.subcontractorId}
                      onChange={(e) => setWageForm({...wageForm, subcontractorId: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Pilih Subkontraktor</option>
                      {subcontractors.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">Periode Mulai</label>
                      <input
                        type="date"
                        value={wageForm.periodStart}
                        onChange={(e) => setWageForm({...wageForm, periodStart: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">Periode Selesai</label>
                      <input
                        type="date"
                        value={wageForm.periodEnd}
                        onChange={(e) => setWageForm({...wageForm, periodEnd: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Total Upah (Rp)</label>
                    <input
                      type="number"
                      value={wageForm.totalAmount}
                      onChange={(e) => setWageForm({...wageForm, totalAmount: e.target.value})}
                      placeholder="0"
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Nama Pekerja</label>
                    <input
                      type="text"
                      value={kasbonForm.workerName}
                      onChange={(e) => setKasbonForm({...kasbonForm, workerName: e.target.value})}
                      placeholder="Nama pekerja..."
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Jumlah Kasbon (Rp)</label>
                    <input
                      type="number"
                      value={kasbonForm.amount}
                      onChange={(e) => setKasbonForm({...kasbonForm, amount: e.target.value})}
                      placeholder="0"
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Keperluan</label>
                    <textarea
                      value={kasbonForm.purpose}
                      onChange={(e) => setKasbonForm({...kasbonForm, purpose: e.target.value})}
                      placeholder="Keperluan kasbon..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-outline-variant">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  if (modalType === 'wage') {
                    if (!wageForm.projectId || !wageForm.subcontractorId) {
                      alert('Proyek dan subkontraktor wajib diisi!');
                      return;
                    }
                    const project = projects.find(p => p.id === wageForm.projectId);
                    const sub = subcontractors.find(s => s.id === wageForm.subcontractorId);
                    const totalAmount = parseFloat(wageForm.totalAmount) || 0;
                    addWagePayment({
                      code: generateCode('WAGE'),
                      projectId: wageForm.projectId,
                      projectName: project?.name || '',
                      subcontractorId: wageForm.subcontractorId,
                      subcontractorName: sub?.name || '',
                      periodStart: wageForm.periodStart,
                      periodEnd: wageForm.periodEnd,
                      workers: [],
                      totalWorkers: 0,
                      totalAmount,
                      deductions: 0,
                      netAmount: totalAmount,
                      status: 'draft',
                    });
                    setWageForm({ projectId: '', subcontractorId: '', periodStart: '', periodEnd: '', totalAmount: '' });
                  } else {
                    if (!kasbonForm.workerName || !kasbonForm.amount) {
                      alert('Nama pekerja dan jumlah wajib diisi!');
                      return;
                    }
                    addKasbon({
                      code: generateCode('KAS'),
                      workerId: '1',
                      workerName: kasbonForm.workerName,
                      subcontractorId: '1',
                      amount: parseFloat(kasbonForm.amount) || 0,
                      purpose: kasbonForm.purpose,
                      requestDate: new Date().toISOString().split('T')[0],
                      status: 'requested',
                      repayments: [],
                      remainingAmount: parseFloat(kasbonForm.amount) || 0,
                    });
                    setKasbonForm({ workerName: '', amount: '', purpose: '' });
                  }
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
