import { Plus, Search, Filter, Package, FileText, Truck, CheckCircle, ChevronDown, ChevronUp, LayoutGrid, List, AlertTriangle, X, Building } from 'lucide-react';
import { useState } from 'react';
import PermissionGuard from '../components/PermissionGuard';
import { useData } from '../context/DataContext';
import { MOCK_SUPPLIERS, MOCK_RABS } from '../data/mockData';

const formatCurrency = (value: number) => {
  if (value >= 1000000000000) return `IDR ${(value / 1000000000000).toFixed(1)}T`;
  if (value >= 1000000000) return `IDR ${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `IDR ${(value / 1000000).toFixed(1)}Jt`;
  return `IDR ${value.toLocaleString()}`;
};

const statusConfig: Record<string, { label: string; className: string; icon: typeof Package }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: FileText },
  sent: { label: 'Terkirim', className: 'bg-blue-100 text-blue-800', icon: Package },
  partial: { label: 'Sebagian', className: 'bg-amber-100 text-amber-800', icon: Truck },
  completed: { label: 'Selesai', className: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800', icon: FileText },
};

export default function Procurement() {
  const { purchaseOrders, projects, suppliers, addPurchaseOrder, generateCode } = useData();
  const [activeTab, setActiveTab] = useState<'pr' | 'po' | 'gr'>('po');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [expandedPo, setExpandedPo] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    projectId: '',
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    items: [] as Array<{name: string; unit: string; quantity: number; price: number}>,
  });

  const toggleExpand = (poId: string) => {
    setExpandedPo(expandedPo === poId ? null : poId);
  };

  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const completedPO = purchaseOrders.filter(po => po.status === 'completed').length;
  const pendingPO = purchaseOrders.filter(po => po.status === 'sent' || po.status === 'partial').length;

  // Group POs by status for Kanban
  const kanbanColumns = {
    draft: purchaseOrders.filter(po => po.status === 'draft'),
    sent: purchaseOrders.filter(po => po.status === 'sent'),
    partial: purchaseOrders.filter(po => po.status === 'partial'),
    completed: purchaseOrders.filter(po => po.status === 'completed'),
  };

  // Budget vs Realization for key materials
  const materialBudget = [
    { name: 'Besi Beton', budget: 500000000, realized: 425000000, unit: 'kg' },
    { name: 'Semen', budget: 300000000, realized: 280000000, unit: 'sak' },
    { name: 'Pipa PVC', budget: 150000000, realized: 165000000, unit: 'btg' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Total PO</p>
            <p className="text-2xl font-bold text-primary">{purchaseOrders.length}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Selesai</p>
            <p className="text-2xl font-bold text-green-600">{completedPO}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Dalam Proses</p>
            <p className="text-2xl font-bold text-amber-600">{pendingPO}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Total Nilai</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(totalPOValue)}</p>
          </div>
        </div>
      </div>

      {/* Workflow Tabs */}
      <div className="flex gap-2 border-b border-outline-variant">
        <button
          onClick={() => setActiveTab('pr')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'pr' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Purchase Request (PR)
        </button>
        <button
          onClick={() => setActiveTab('po')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'po' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Purchase Order (PO)
        </button>
        <button
          onClick={() => setActiveTab('gr')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'gr' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Goods Receipt (GR)
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder={`Cari ${activeTab.toUpperCase()}...`}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <PermissionGuard module="procurement" action="create">
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-outline-variant overflow-hidden">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-low'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 text-sm ${viewMode === 'kanban' ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-low'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Buat {activeTab.toUpperCase()}
            </button>
          </div>
        </PermissionGuard>
      </div>

      {/* Budget vs Realization */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-on-surface">Budget vs Realization - Key Materials</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {materialBudget.map((mat) => {
            const percentage = (mat.realized / mat.budget) * 100;
            const isOverBudget = percentage > 100;
            return (
              <div key={mat.name} className="p-4 bg-surface-container-low rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-on-surface">{mat.name}</span>
                  <span className={`text-sm font-bold ${isOverBudget ? 'text-error' : 'text-green-600'}`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-surface-container-high rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full ${isOverBudget ? 'bg-error' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>RAB: {formatCurrency(mat.budget)}</span>
                  <span>Real: {formatCurrency(mat.realized)}</span>
                </div>
                {isOverBudget && (
                  <p className="text-xs text-error mt-1">⚠️ Over budget!</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PO Content - List or Kanban */}
      {activeTab === 'po' && viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { key: 'draft', label: 'Draft', color: 'border-l-4 border-gray-400' },
            { key: 'sent', label: 'Purchase Order', color: 'border-l-4 border-blue-500' },
            { key: 'partial', label: 'On Delivery', color: 'border-l-4 border-amber-500' },
            { key: 'completed', label: 'Goods Received', color: 'border-l-4 border-green-500' },
          ].map((column) => (
            <div key={column.key} className="bg-surface-container-low rounded-xl p-3">
              <div className={`flex items-center justify-between mb-3 pb-2 border-b border-outline-variant ${column.color} pl-2`}>
                <span className="font-semibold text-on-surface">{column.label}</span>
                <span className="text-xs text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">
                  {kanbanColumns[column.key as keyof typeof kanbanColumns].length}
                </span>
              </div>
              <div className="space-y-3">
                {kanbanColumns[column.key as keyof typeof kanbanColumns].map((po) => (
                  <div key={po.id} className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant hover:shadow-md transition-shadow cursor-pointer">
                    <p className="text-sm font-medium text-primary mb-1">{po.code}</p>
                    <p className="text-xs text-on-surface-variant mb-2">{po.supplierName}</p>
                    <p className="text-sm font-bold text-on-surface">{formatCurrency(po.totalAmount)}</p>
                    <div className="mt-2 text-xs text-on-surface-variant">
                      {po.items.length} item{po.items.length > 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'po' ? (
        <div className="space-y-4">
          {purchaseOrders.map((po) => {
            const StatusIcon = statusConfig[po.status]?.icon || Package;
            return (
              <div key={po.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors"
                  onClick={() => toggleExpand(po.id)}
                >
                  <div className="flex items-center gap-4">
                    <StatusIcon className="w-8 h-8 text-primary" />
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary">{po.code}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[po.status]?.className}`}>
                          {statusConfig[po.status]?.label}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface mt-1">{po.projectName}</p>
                      <p className="text-xs text-on-surface-variant">{po.supplierName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-on-surface">{formatCurrency(po.totalAmount)}</p>
                      <p className="text-xs text-on-surface-variant">Order: {po.orderDate} | Delivery: {po.deliveryDate}</p>
                    </div>
                    {expandedPo === po.id ? <ChevronUp className="w-5 h-5 text-on-surface-variant" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
                  </div>
                </div>

                {expandedPo === po.id && (
                  <div className="border-t border-outline-variant p-4">
                    <h4 className="text-sm font-semibold text-on-surface mb-3">Item Pembelian</h4>
                    <table className="w-full">
                      <thead className="bg-surface-container-low">
                        <tr>
                          <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-left">Item</th>
                          <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Qty</th>
                          <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Satuan</th>
                          <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Harga</th>
                          <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-right">Total</th>
                          <th className="px-4 py-2 text-xs font-medium text-on-surface-variant text-center">Terima</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {po.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-on-surface">{item.itemName}</td>
                            <td className="px-4 py-3 text-sm text-on-surface text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-on-surface-variant text-right">{item.unit}</td>
                            <td className="px-4 py-3 text-sm text-on-surface text-right">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-on-surface text-right">{formatCurrency(item.total)}</td>
                            <td className="px-4 py-3 text-sm text-on-surface text-center">{item.deliveredQuantity} / {item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-surface-container-low">
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-sm font-medium text-on-surface text-right">Total:</td>
                          <td className="px-4 py-3 text-sm font-bold text-primary text-right">{formatCurrency(po.totalAmount)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center">
          <FileText className="w-12 h-12 text-on-surface-variant mx-auto mb-3 opacity-30" />
          <p className="text-on-surface-variant">Modul Purchase Request akan ditampilkan di sini</p>
          <p className="text-sm text-on-surface-variant mt-2">PR → PO → GR workflow</p>
        </div>
      )}

      {/* GR Tab Placeholder */}
      {activeTab === 'gr' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center">
          <Truck className="w-12 h-12 text-on-surface-variant mx-auto mb-3 opacity-30" />
          <p className="text-on-surface-variant">Modul Goods Receipt akan ditampilkan di sini</p>
          <p className="text-sm text-on-surface-variant mt-2">Penerimaan barang dari PO</p>
        </div>
      )}

      {/* Create PO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="text-xl font-headline font-bold text-on-surface">Buat Purchase Order</h2>
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
                <label className="block text-sm font-medium text-on-surface mb-2">Supplier</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Pilih Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Tanggal Order</label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({...formData, orderDate: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Tanggal Kirim</label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
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
                onClick={() => {
                  if (!formData.projectId || !formData.supplierId) {
                    alert('Proyek dan supplier wajib diisi!');
                    return;
                  }
                  const project = projects.find(p => p.id === formData.projectId);
                  const supplier = suppliers.find(s => s.id === formData.supplierId);
                  addPurchaseOrder({
                    code: generateCode('PO'),
                    prId: '',
                    prCode: '-',
                    projectId: formData.projectId,
                    projectName: project?.name || '',
                    supplierId: formData.supplierId,
                    supplierName: supplier?.name || '',
                    orderDate: formData.orderDate,
                    deliveryDate: formData.deliveryDate,
                    status: 'draft',
                    items: [],
                    totalAmount: 0,
                    createdBy: 'User',
                  });
                  setFormData({
                    projectId: '',
                    supplierId: '',
                    orderDate: new Date().toISOString().split('T')[0],
                    deliveryDate: '',
                    items: [],
                  });
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
              >
                Simpan PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
