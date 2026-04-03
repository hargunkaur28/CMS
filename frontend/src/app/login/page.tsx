'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, GraduationCap, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore, roleRedirect, AuthUser } from '@/store/authStore';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const router  = useRouter();
  const setUser = useAuthStore(s => s.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await api.post<AuthUser>('/auth/login', { email, password });
      setUser(data);
      router.push(roleRedirect[data.role] ?? '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick-fill helpers for demo
  const fillDemo = (role: 'admin') => {
    if (role === 'admin') { setEmail('admin@git.edu'); setPassword('admin123'); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">NgCMS ERP</h2>
          <p className="text-slate-400 mt-2">Sign in to your college account</p>
        </div>

        {/* Demo credentials hint */}
        <div className="mb-6 p-3 bg-indigo-900/40 border border-indigo-700/40 rounded-xl">
          <p className="text-xs text-indigo-300 font-medium mb-2">🚀 Demo credentials:</p>
          <button
            type="button"
            onClick={() => fillDemo('admin')}
            className="text-xs bg-indigo-700/50 hover:bg-indigo-700 text-indigo-200 px-3 py-1.5 rounded-lg transition-colors font-mono"
          >
            Super Admin — admin@git.edu / admin123
          </button>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 p-3 bg-red-900/40 border border-red-700/40 rounded-xl text-red-300 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-slate-300 ml-1 mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                placeholder="admin@git.edu"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-slate-300 ml-1 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-400 cursor-pointer gap-2">
              <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-indigo-500" />
              Remember me
            </label>
            <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Forgot Password?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><LogIn className="w-5 h-5" /><span>Sign In</span></>
            )}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Need help?{' '}
          <a href="#" className="text-slate-300 hover:text-white transition-colors underline underline-offset-4">Contact Support</a>
        </p>
      </motion.div>
    </div>
  );
}
