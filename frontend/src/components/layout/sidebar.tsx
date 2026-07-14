'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  History,
  Receipt,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { RoleBadge } from '@/components/ui/badge';
import type { Role } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  EMPLOYEE: [
    { label: 'Dashboard', href: '/employee', icon: LayoutDashboard },
    { label: 'My Claims', href: '/employee/claims', icon: FileText },
  ],
  MANAGER: [
    { label: 'Dashboard', href: '/manager', icon: LayoutDashboard },
    { label: 'Pending Claims', href: '/manager/claims', icon: Receipt },
    { label: 'Action History', href: '/manager/history', icon: History },
  ],
  SENIOR_MANAGER: [
    { label: 'Dashboard', href: '/senior-manager', icon: LayoutDashboard },
    { label: 'Pending Claims', href: '/senior-manager/claims', icon: Receipt },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'All Claims', href: '/admin/claims', icon: FileText },
    { label: 'Monthly Summary', href: '/admin/summary', icon: BarChart3 },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = NAV_BY_ROLE[user.role];

  const content = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-6 py-5">
        <Link href={navItems[0].href} className="text-xl font-bold text-indigo-600">
          ExpenseFlow
        </Link>
        <p className="mt-1 text-xs text-slate-500">Expense management</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 rounded-lg bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-900">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-slate-500">{user.email}</p>
          <div className="mt-2">
            <RoleBadge role={user.role} />
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="fixed left-4 top-4 z-40 rounded-lg border border-slate-200 bg-white p-2 lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <button
          className="absolute right-3 top-4 rounded-lg p-1 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {content}
      </aside>
    </>
  );
}

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="pl-10 lg:pl-0">
          <p className="text-sm text-slate-500">Welcome back</p>
          <p className="font-semibold text-slate-900">
            {user ? `${user.firstName} ${user.lastName}` : 'ExpenseFlow'}
          </p>
        </div>
        {user && <RoleBadge role={user.role} />}
      </div>
    </header>
  );
}
