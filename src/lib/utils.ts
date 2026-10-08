import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApplicationStatus, PaymentStatus } from '../types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('NGN', '₦');
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function generateApplicationNumber(sequence = Math.floor(1000 + Math.random() * 9000)): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(6, '0');
  return `APP/${year}/${padded}`;
}

export function generateMatricNumber(
  year: number = new Date().getFullYear(),
  facultyCode = 'FCIT',
  deptCode = 'CSC',
  sequence = Math.floor(1 + Math.random() * 999)
): string {
  const padded = String(sequence).padStart(4, '0');
  return `${year}/${facultyCode}/${deptCode}/${padded}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `INV-${year}-${random}`;
}

export function generatePaymentReference(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TXN-PFUST-${ts}-${rand}`;
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `REC/${year}/${random}`;
}

export function getApplicationStatusBadge(status: ApplicationStatus) {
  switch (status) {
    case 'draft':
      return { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    case 'pending_payment':
      return { label: 'Pending Payment', color: 'bg-amber-50 text-amber-800 border-amber-300' };
    case 'paid':
      return { label: 'Paid (Pending Submission)', color: 'bg-blue-50 text-blue-700 border-blue-300' };
    case 'submitted':
      return { label: 'Submitted', color: 'bg-indigo-50 text-indigo-700 border-indigo-300' };
    case 'under_review':
      return { label: 'Under Review', color: 'bg-amber-100 text-amber-800 border-amber-400' };
    case 'correction_required':
      return { label: 'Correction Required', color: 'bg-rose-50 text-rose-700 border-rose-300' };
    case 'approved':
      return { label: 'Approved (Screened)', color: 'bg-teal-50 text-teal-800 border-teal-300' };
    case 'admitted':
      return { label: 'Admitted / Offer Made', color: 'bg-emerald-50 text-emerald-800 border-emerald-400' };
    case 'rejected':
      return { label: 'Not Admitted', color: 'bg-red-50 text-red-800 border-red-300' };
    default:
      return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-300' };
  }
}

export function getPaymentStatusBadge(status: PaymentStatus) {
  switch (status) {
    case 'successful':
      return { label: 'Successful', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
    case 'pending':
      return { label: 'Pending', color: 'bg-amber-50 text-amber-800 border-amber-300' };
    case 'failed':
      return { label: 'Failed', color: 'bg-rose-50 text-rose-800 border-rose-300' };
    case 'cancelled':
      return { label: 'Cancelled', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    case 'refunded':
      return { label: 'Refunded', color: 'bg-purple-50 text-purple-800 border-purple-300' };
    default:
      return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-300' };
  }
}
