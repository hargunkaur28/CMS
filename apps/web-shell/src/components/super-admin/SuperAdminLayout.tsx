'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/super-admin/dashboard', color: 'from-blue-500 to-blue-600' },
    { id: 'colleges', label: 'College Management', icon: '🏢', href: '/super-admin/colleges', color: 'from-purple-500 to-purple-600' },
    { id: 'users', label: 'User Management', icon: '👥', href: '/super-admin/users', color: 'from-green-500 to-green-600' },
    { id: 'analytics', label: 'Analytics', icon: '📈', href: '/super-admin/analytics', color: 'from-orange-500 to-orange-600' },
    { id: 'audit', label: 'Audit Logs', icon: '📋', href: '/super-admin/audit-logs', color: 'from-red-500 to-red-600' },
    { id: 'settings', label: 'System Settings', icon: '⚙️', href: '/super-admin/settings', color: 'from-indigo-500 to-indigo-600' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col shadow-lg`}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Super Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveMenu(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                activeMenu === item.id
                  ? `bg-gradient-to-r ${item.color} shadow-lg`
                  : 'hover:bg-gray-700'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-700 p-3">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Platform Administration</h2>
            <p className="text-sm text-gray-600">Manage colleges, users, and system settings</p>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                SA
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-medium text-gray-900">Super Admin</p>
                <p className="text-xs text-gray-600">Platform Owner</p>
              </div>
              <ChevronDown size={18} className="text-gray-600" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push('/super-admin/settings');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <Settings size={16} /> Profile Settings
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    setUserMenuOpen(false);
                    router.push('/login');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600 border-t border-gray-200"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
