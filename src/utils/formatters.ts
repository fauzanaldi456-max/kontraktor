/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Format currency ke format IDR
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) return `IDR ${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000_000) return `IDR ${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `IDR ${(value / 1_000_000).toFixed(1)}Jt`;
  return `IDR ${value.toLocaleString()}`;
}

/**
 * Format tanggal ke format Indonesia
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format tanggal dengan waktu
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
