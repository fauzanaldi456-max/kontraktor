/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Local formatCurrency untuk menghindari circular import
const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000_000) return `IDR ${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000_000) return `IDR ${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `IDR ${(value / 1_000_000).toFixed(1)}Jt`;
  return `IDR ${value.toLocaleString()}`;
};

/**
 * Utility untuk export data ke CSV (bisa dibuka di Excel)
 */
export function exportToCSV(
  data: Array<Record<string, string | number | undefined>>,
  filename: string,
  headers: Record<string, string>
) {
  // Buat header CSV
  const headerRow = Object.values(headers).join(',');
  
  // Buat rows data
  const rows = data.map(item => {
    return Object.keys(headers).map(key => {
      const value = item[key];
      // Escape value jika mengandung koma atau quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });
  
  // Gabungkan header dan rows
  const csvContent = [headerRow, ...rows].join('\n');
  
  // Download file
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Utility untuk print dokumen
 */
export function printDocument(
  title: string,
  content: string,
  styles?: string
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup blocked! Please allow popups for this site.');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h1 { font-size: 18pt; margin-bottom: 10pt; border-bottom: 2pt solid #333; padding-bottom: 5pt; }
        h2 { font-size: 14pt; margin-top: 15pt; margin-bottom: 8pt; color: #444; }
        table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
        th, td { border: 1pt solid #ddd; padding: 8pt; text-align: left; font-size: 10pt; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .header-info { margin-bottom: 15pt; font-size: 10pt; }
        .header-info p { margin: 2pt 0; }
        .signature-section { margin-top: 30pt; display: flex; justify-content: space-between; }
        .signature-box { width: 150pt; text-align: center; }
        .signature-line { border-top: 1pt solid #333; margin-top: 40pt; padding-top: 5pt; }
        .footer { margin-top: 20pt; font-size: 8pt; color: #666; border-top: 1pt solid #ddd; padding-top: 10pt; }
        ${styles || ''}
      </style>
    </head>
    <body>
      ${content}
      <div class="footer">
        <p>Dicetak pada: ${new Date().toLocaleString('id-ID')} | Lagoi Bay ERP</p>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    // printWindow.close(); // Biarkan window tertutup otomatis setelah print atau user tutup
  }, 500);
}

/**
 * Generate HTML untuk print RAB
 */
export function generateRABPrintHTML(rab: {
  code: string;
  projectName: string;
  versionName: string;
  items: Array<{
    code: string;
    name: string;
    category: string;
    volume: number;
    unit: string;
    price: number;
    total: number;
  }>;
  totalMaterial: number;
  totalUpah: number;
  totalOperasional: number;
  grandTotal: number;
  createdBy: string;
  createdAt: string;
}) {
  const items = rab.items || [];
  
  return `
    <h1>RANCANGAN ANGGARAN BIAYA (RAB)</h1>
    <div class="header-info">
      <p><strong>Kode:</strong> ${rab.code}</p>
      <p><strong>Proyek:</strong> ${rab.projectName}</p>
      <p><strong>Versi:</strong> ${rab.versionName}</p>
      <p><strong>Dibuat:</strong> ${rab.createdBy} (${new Date(rab.createdAt).toLocaleDateString('id-ID')})</p>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Kode</th>
          <th>Uraian Pekerjaan</th>
          <th>Volume</th>
          <th>Sat</th>
          <th class="text-right">Harga Satuan</th>
          <th class="text-right">Jumlah</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item, index) => `
          <tr>
            <td class="text-center">${index + 1}</td>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td class="text-right">${item.volume}</td>
            <td>${item.unit}</td>
            <td class="text-right">${formatCurrency(item.price)}</td>
            <td class="text-right">${formatCurrency(item.total)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr style="font-weight: bold; background-color: #f5f5f5;">
          <td colspan="6" class="text-right">TOTAL MATERIAL:</td>
          <td class="text-right">${formatCurrency(rab.totalMaterial)}</td>
        </tr>
        <tr style="font-weight: bold; background-color: #f5f5f5;">
          <td colspan="6" class="text-right">TOTAL UPAH:</td>
          <td class="text-right">${formatCurrency(rab.totalUpah)}</td>
        </tr>
        <tr style="font-weight: bold; background-color: #f5f5f5;">
          <td colspan="6" class="text-right">TOTAL OPERASIONAL:</td>
          <td class="text-right">${formatCurrency(rab.totalOperasional)}</td>
        </tr>
        <tr style="font-weight: bold; font-size: 12pt; background-color: #e8e8e8;">
          <td colspan="6" class="text-right">GRAND TOTAL:</td>
          <td class="text-right">${formatCurrency(rab.grandTotal)}</td>
        </tr>
      </tfoot>
    </table>
    
    <div class="signature-section">
      <div className="signature-box">
        <p>Dibuat oleh,</p>
        <div class="signature-line">
          <p>${rab.createdBy}</p>
          <p>Project Manager</p>
        </div>
      </div>
      <div className="signature-box">
        <p>Diperiksa oleh,</p>
        <div class="signature-line">
          <p>(_________________)</p>
          <p>Supervisor Lapangan</p>
        </div>
      </div>
      <div className="signature-box">
        <p>Disetujui oleh,</p>
        <div class="signature-line">
          <p>(_________________)</p>
          <p>Owner</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate HTML untuk print SPK
 */
export function generateSPKPrintHTML(spk: {
  code: string;
  projectName: string;
  vendorName: string;
  type: string;
  value: number;
  startDate?: string;
  endDate?: string;
  terms: Array<{
    termNumber: number;
    description: string;
    percentage: number;
    amount: number;
    dueDate?: string;
  }>;
}) {
  const terms = spk.terms || [];
  
  return `
    <h1>SURAT PERINTAH KERJA (SPK)</h1>
    <div class="header-info">
      <p><strong>Kode SPK:</strong> ${spk.code}</p>
      <p><strong>Proyek:</strong> ${spk.projectName}</p>
      <p><strong>Vendor:</strong> ${spk.vendorName}</p>
      <p><strong>Tipe:</strong> ${spk.type}</p>
      <p><strong>Periode:</strong> ${spk.startDate || '-'} s/d ${spk.endDate || '-'}</p>
    </div>
    
    <h2>Nilai Kontrak</h2>
    <p style="font-size: 14pt; font-weight: bold;">${formatCurrency(spk.value)}</p>
    
    <h2>Jadwal Termin Pembayaran</h2>
    <table>
      <thead>
        <tr>
          <th>Termin</th>
          <th>Deskripsi</th>
          <th class="text-center">%</th>
          <th class="text-right">Jumlah</th>
          <th>Jatuh Tempo</th>
        </tr>
      </thead>
      <tbody>
        ${terms.map(term => `
          <tr>
            <td class="text-center">${term.termNumber}</td>
            <td>${term.description}</td>
            <td class="text-center">${term.percentage}%</td>
            <td class="text-right">${formatCurrency(term.amount)}</td>
            <td>${term.dueDate || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="signature-section">
      <div className="signature-box">
        <p>Vendor,</p>
        <div class="signature-line">
          <p>${spk.vendorName}</p>
        </div>
      </div>
      <div className="signature-box">
        <p>Project Manager,</p>
        <div class="signature-line">
          <p>(_________________)</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Export data laporan ke Excel/CSV
 */
export function exportReportToCSV(
  reportType: 'projects' | 'rabs' | 'spks' | 'progress' | 'finance',
  data: Array<Record<string, unknown>>
) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (reportType) {
    case 'projects':
      exportToCSV(
        data as Array<Record<string, string | number | undefined>>,
        `Laporan_Proyek_${timestamp}`,
        {
          code: 'Kode Proyek',
          name: 'Nama Proyek',
          client: 'Klien',
          location: 'Lokasi',
          contractValue: 'Nilai Kontrak',
          status: 'Status',
          progress: 'Progress %',
          startDate: 'Tanggal Mulai',
          endDate: 'Tanggal Selesai',
        }
      );
      break;
      
    case 'finance':
      exportToCSV(
        data as Array<Record<string, string | number | undefined>>,
        `Laporan_Keuangan_${timestamp}`,
        {
          code: 'Kode Jurnal',
          date: 'Tanggal',
          type: 'Tipe',
          category: 'Kategori',
          projectName: 'Proyek',
          description: 'Deskripsi',
          amount: 'Jumlah',
        }
      );
      break;
      
    default:
      exportToCSV(
        data as Array<Record<string, string | number | undefined>>,
        `Export_${reportType}_${timestamp}`,
        Object.keys(data[0] || {}).reduce((acc, key) => {
          acc[key] = key.charAt(0).toUpperCase() + key.slice(1);
          return acc;
        }, {} as Record<string, string>)
      );
  }
}
