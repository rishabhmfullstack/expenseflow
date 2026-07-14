import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ClaimStatus, Role } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getStatusColor(status: ClaimStatus) {
  const map: Record<ClaimStatus, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    REVERTED_TO_EMPLOYEE: 'bg-amber-100 text-amber-800',
    PENDING_MANAGER: 'bg-blue-100 text-blue-800',
    REVERTED_TO_MANAGER: 'bg-orange-100 text-orange-800',
    PENDING_SENIOR_MANAGER: 'bg-indigo-100 text-indigo-800',
    APPROVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-600',
  };
  return map[status];
}

export function getRoleColor(role: Role) {
  const map: Record<Role, string> = {
    EMPLOYEE: 'bg-slate-100 text-slate-700',
    MANAGER: 'bg-blue-100 text-blue-800',
    SENIOR_MANAGER: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-rose-100 text-rose-800',
  };
  return map[role];
}
