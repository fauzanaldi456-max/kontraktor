/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Target, Percent } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const COLORS = ['#002147', '#fd8b00', '#10b981', '#ef4444'];

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, spks, journals, deviations } = useData();

  // Calculate KPIs
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'execution').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  
  const totalContractValue = projects.reduce((sum, p) => sum + p.contractValue, 0);
  const activeSPKs = spks.filter(s => s.status === 'active').length;
  
  const totalIncome = journals.filter(j => j.type === 'income').reduce((sum, j) => sum + j.amount, 0);
  const totalExpense = journals.filter(j => j.type === 'expense').reduce((sum, j) => sum + j.amount, 0);
  const cashFlow = totalIncome - totalExpense;

  const pendingDeviations = deviations.filter(d => d.status === 'draft' || d.status === 'review').length;

  // Calculate Cost Accuracy and Profit Margin
  const rabTotal = totalContractValue; // Using contract value as RAB baseline
  const realizedCost = totalExpense; // Using total expense as realized cost
  const costAccuracy = rabTotal > 0 ? ((rabTotal - Math.abs(rabTotal - realizedCost)) / rabTotal) * 100 : 0;
  const profitMargin = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Chart Data
  const projectStatusData = [
    { name: 'Planning', value: projects.filter(p => p.status === 'planning').length },
    { name: 'RAB', value: projects.filter(p => p.status === 'rab').length },
    { name: 'SPK', value: projects.filter(p => p.status === 'spk').length },
    { name: 'Execution', value: projects.filter(p => p.status === 'execution').length },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length },
  ];

  const cashFlowData = [
    { name: 'Jan', income: 2500000000, expense: 1800000000 },
    { name: 'Feb', income: 1800000000, expense: 1200000000 },
    { name: 'Mar', income: 2200000000, expense: 1600000000 },
    { name: 'Apr', income: 2800000000, expense: 2000000000 },
    { name: 'May', income: 1500000000, expense: 1000000000 },
    { name: 'Jun', income: 3000000000, expense: 2200000000 },
  ];

  const projectProgressData = projects.filter(p => p.status === 'execution').map(p => ({
    name: p.code,
    progress: p.progress,
    target: 100,
  }));

  const formatCurrency = (value: number) => {
    if (value >= 1000000000000) return `IDR ${(value / 1000000000000).toFixed(1)}T`;
    if (value >= 1000000000) return `IDR ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `IDR ${(value / 1000000).toFixed(1)}Jt`;
    return `IDR ${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-on-primary">
        <h2 className="text-2xl font-headline font-bold">Selamat Datang, {user?.name}</h2>
        <p className="text-on-primary/80 mt-1">Dashboard ERP Kontraktor - Ringkasan Proyek & Keuangan</p>
      </div>

      {/* Executive KPI Cards - Cost Accuracy & Profit Margin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Akurasi Biaya</p>
              <p className="text-3xl font-headline font-bold text-blue-800 mt-1">{costAccuracy.toFixed(1)}%</p>
              <p className="text-xs text-blue-600 mt-1">Target: &gt;95%</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(costAccuracy, 100)}%` }} />
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {costAccuracy >= 95 ? '✅ Sesuai target' : '⚠️ Di bawah target'}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Margin Laba</p>
              <p className="text-3xl font-headline font-bold text-green-800 mt-1">{profitMargin.toFixed(1)}%</p>
              <p className="text-xs text-green-600 mt-1">Bersih: {formatCurrency(cashFlow)}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center">
              <Percent className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full" style={{ width: `${Math.max(0, Math.min(profitMargin, 100))}%` }} />
            </div>
            <p className="text-xs text-green-600 mt-1">
              {profitMargin > 0 ? '✅ Menguntungkan' : '❌ Rugi'}
            </p>
          </div>
        </div>
      </div>

      {/* Standard KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Total Proyek</p>
              <p className="text-2xl font-headline font-bold text-primary mt-1">{totalProjects}</p>
              <p className="text-xs text-secondary mt-1">{activeProjects} aktif, {completedProjects} selesai</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Nilai Kontrak</p>
              <p className="text-2xl font-headline font-bold text-primary mt-1">{formatCurrency(totalContractValue)}</p>
              <p className="text-xs text-secondary mt-1">{activeSPKs} SPK aktif</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Arus Kas</p>
              <p className={`text-2xl font-headline font-bold mt-1 ${cashFlow >= 0 ? 'text-green-600' : 'text-error'}`}>
                {formatCurrency(cashFlow)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {cashFlow >= 0 ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-error" />}
                <span className="text-xs text-on-surface-variant">Arus kas bersih</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant">Deviasi Pending</p>
              <p className="text-2xl font-headline font-bold text-error mt-1">{pendingDeviations}</p>
              <p className="text-xs text-error mt-1">Butuh persetujuan</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 - P&L and Cashflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
          <h3 className="text-lg font-headline font-semibold text-on-surface mb-4">Laba Rugi Proyek</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e2e2" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `IDR${v/1000000}Jt`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="income" name="Pendapatan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Biaya" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
          <h3 className="text-lg font-headline font-semibold text-on-surface mb-4">Cashflow Trend (6 Bulan)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e2e2" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `IDR${v/1000000}Jt`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="income" name="Kas Masuk" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expense" name="Kas Keluar" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 - RAB vs Realization & SPK vs Field Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
          <h3 className="text-lg font-headline font-semibold text-on-surface mb-4">RAB vs Realisasi</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
              <span className="text-sm text-on-surface">RAB (Dasar)</span>
              <span className="font-bold text-primary">{formatCurrency(rabTotal)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
              <span className="text-sm text-on-surface">Biaya Realisasi</span>
              <span className="font-bold text-amber-600">{formatCurrency(realizedCost)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm text-green-800">Selisih</span>
              <span className={`font-bold ${rabTotal - realizedCost >= 0 ? 'text-green-600' : 'text-error'}`}>
                {formatCurrency(Math.abs(rabTotal - realizedCost))} {rabTotal - realizedCost >= 0 ? '(Hemat)' : '(Lebih)'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
          <h3 className="text-lg font-headline font-semibold text-on-surface mb-4">SPK vs Field Progress</h3>
          <div className="space-y-4">
            {spks.slice(0, 3).map((spk) => {
              const paidTerms = spk.terms.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
              const progress = (paidTerms / spk.value) * 100;
              return (
                <div key={spk.id} className="p-3 bg-surface-container-low rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-on-surface">{spk.code}</span>
                    <span className="text-sm font-bold text-primary">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                    <span>Nilai: {formatCurrency(spk.value)}</span>
                    <span>Terbayar: {formatCurrency(paidTerms)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      {projectProgressData.length > 0 && (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
          <h3 className="text-lg font-headline font-semibold text-on-surface mb-4">Progress Proyek Aktif</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectProgressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e2e2" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="progress" name="Kemajuan" fill="#002147" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

