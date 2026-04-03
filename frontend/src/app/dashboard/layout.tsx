'use client';

import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
