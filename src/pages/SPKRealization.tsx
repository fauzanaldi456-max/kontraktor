import { Search, Filter, BarChart3, Plus, AlertTriangle, X, Building } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import PermissionGuard from '../components/PermissionGuard';
import { useData } from '../context/DataContext';

const formatCurrency = (value: number) => {
  if (value >= 1000000000000) return `IDR ${(value / 1000000000000).toFixed(1)}T`;
  if (value >= 1000000000) return `IDR ${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `IDR ${(value / 1000000).toFixed(1)}Jt`;
  return `IDR ${value.toLocaleString()}`;
};

const devStatusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
  review: { label: 'Review', className: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Disetujui', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
};

const devTypeConfig: Record<string, { label: string; color: string }> = {
  addition: { label: 'Tambah', color: 'text-green-600' },
  reduction: { label: 'Kurang', color: 'text-red-600' },
};

export default function SPKRealization() {
  const { spks, deviations, projects, addDeviation, generateCode } = useData();
  const [expandedSpk, setExpandedSpk] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    projectId: '',
    spkId: '',
    itemName: '',
    type: 'addition' as 'addition' | 'reduction',
    spkVolume: '',
    realizedVolume: '',
    unitPrice: '',
    reason: '',
  });

  const toggleExpand = (spkId: string) => {
    setExpandedSpk(expandedSpk === spkId ? null : spkId);
  };

  // Calculate realization data from SPKs
  const realizationData = spks.map(spk => {
    const paidTerms = spk.terms.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
    const progress = (paidTerms / spk.value) * 100;
    return {
      id: spk.code,
      vendor: spk.vendorName,
      spkValue: spk.value / 1000000,
      realized: paidTerms / 1000000,
      progress: Math.round(progress),
    };
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Total SPK</p>
          <p className="text-2xl font-bold text-primary">{spks.length}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Deviasi</p>
          <p className="text-2xl font-bold text-amber-600">{deviations.length}</p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Pending Approval</p>
          <p className="text-2xl font-bold text-purple-600">
            {deviations.filter(d => d.status === 'draft' || d.status === 'review').length}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <p className="text-sm text-on-surface-variant">Nilai Deviasi</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(deviations.reduce((sum, d) => sum + Math.abs(d.deviationAmount), 0))}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
        <h3 className="text-lg font-headline font-semibold text-on-surface mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          SPK Value vs Realisasi (dalam Jutaan Rp)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={realizationData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e2e2" />
              <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(v) => `Rp${v}M`} />
              <YAxis dataKey="id" type="category" axisLine={false} tickLine={false} width={120} />
              <Tooltip formatter={(v: number) => formatCurrency(v * 1000000)} />
              <Legend />
              <Bar dataKey="spkValue" name="Nilai SPK" fill="#002147" radius={[0, 4, 4, 0]} />
              <Bar dataKey="realized" name="Realisasi" fill="#fd8b00" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deviation Section */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-headline font-semibold text-on-surface flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-error" />
            Deviasi Pekerjaan (Tambah/Kurang)
          </h3>
          <PermissionGuard module="realization" action="create">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Input Deviasi
            </button>
          </PermissionGuard>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-left">Kode</th>
                <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-left">SPK</th>
                <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-left">Item Pekerjaan</th>
                <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-center">Jenis</th>
                <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Volume SPK</th>
                <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Realisasi</th>
                <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Deviasi</th>
                <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Dampak Finansial</th>
                <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {deviations.map((dev) => (
                <tr key={dev.id} className="hover:bg-surface-container-lowest">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{dev.code}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">{dev.spkCode}</td>
                  <td className="px-4 py-3 text-sm text-on-surface">{dev.itemName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium ${devTypeConfig[dev.type].color}`}>
                      {devTypeConfig[dev.type].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface text-right">{dev.spkVolume}</td>
                  <td className="px-4 py-3 text-sm text-on-surface text-right">{dev.realizedVolume}</td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    <span className={dev.deviationVolume > 0 ? 'text-green-600' : 'text-red-600'}>
                      {dev.deviationVolume > 0 ? '+' : ''}{dev.deviationVolume}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    <span className={dev.deviationAmount > 0 ? 'text-green-600' : 'text-red-600'}>
                      {dev.deviationAmount > 0 ? '+' : ''}{formatCurrency(dev.deviationAmount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${devStatusConfig[dev.status]?.className}`}>
                      {devStatusConfig[dev.status]?.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SPK Realization List */}
      <div className="space-y-4">
        {spks.map((spk) => {
          const realized = spk.terms.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
          const progress = spk.value > 0 ? (realized / spk.value) * 100 : 0;
          return (
          <div key={spk.code} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            <div className="p-4 border-b border-outline-variant">
              <h3 className="font-semibold text-on-surface">Detail Realisasi per SPK</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface">SPK</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface">Vendor/Subcon</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface text-right">Nilai SPK</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface text-right">Realisasi</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface text-right">Sisa</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  <tr className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary">{spk.code}</td>
                    <td className="px-6 py-4 text-sm text-on-surface">{spk.vendorName}</td>
                    <td className="px-6 py-4 text-sm text-on-surface text-right">{formatCurrency(spk.value)}</td>
                    <td className="px-6 py-4 text-sm text-on-surface text-right">{formatCurrency(realized)}</td>
                    <td className="px-6 py-4 text-sm text-on-surface text-right">{formatCurrency(spk.value - realized)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden min-w-[60px]">
                          <div 
                            className="h-full bg-secondary-container rounded-full" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-on-surface">{Math.round(progress)}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          );
        })}
      </div>

      {/* Create Deviation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="text-xl font-headline font-bold text-on-surface">Input Deviasi</h2>
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
                <label className="block text-sm font-medium text-on-surface mb-2">Jenis Deviasi</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as typeof formData.type})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="addition">Kerja Tambah</option>
                  <option value="reduction">Kerja Kurang</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Nama Item Pekerjaan</label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                  placeholder="Contoh: Pekerjaan Pondasi"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Volume SPK</label>
                  <input
                    type="number"
                    value={formData.spkVolume}
                    onChange={(e) => setFormData({...formData, spkVolume: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Volume Realisasi</label>
                  <input
                    type="number"
                    value={formData.realizedVolume}
                    onChange={(e) => setFormData({...formData, realizedVolume: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Harga Satuan (Rp)</label>
                <input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Alasan Deviasi</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Jelaskan alasan deviasi..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
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
                onClick={() => {
                  if (!formData.projectId || !formData.itemName) {
                    alert('Proyek dan nama item wajib diisi!');
                    return;
                  }
                  const spkVolume = parseFloat(formData.spkVolume) || 0;
                  const realizedVolume = parseFloat(formData.realizedVolume) || 0;
                  const unitPrice = parseFloat(formData.unitPrice) || 0;
                  const deviationVolume = realizedVolume - spkVolume;
                  const deviationAmount = deviationVolume * unitPrice;
                  
                  addDeviation({
                    code: generateCode('DEV'),
                    projectId: formData.projectId,
                    spkId: formData.spkId || '1',
                    spkCode: 'SPK-001',
                    projectItemId: '1',
                    itemName: formData.itemName,
                    type: formData.type,
                    spkVolume,
                    realizedVolume,
                    deviationVolume,
                    unitPrice,
                    deviationAmount,
                    reason: formData.reason,
                    status: 'draft',
                    requestedBy: 'User',
                  });
                  setFormData({
                    projectId: '',
                    spkId: '',
                    itemName: '',
                    type: 'addition',
                    spkVolume: '',
                    realizedVolume: '',
                    unitPrice: '',
                    reason: '',
                  });
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
              >
                Simpan Deviasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
