'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, Lock, User as UserIcon, LogIn, AlertCircle, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithUsernameOrEmail, signUpWithUsername } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Loading State Screen
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse">
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="tracking-widest uppercase font-semibold">VERIFYING AUTH ACCESS...</span>
        </div>
      </div>
    );
  }

  // 2. Full-Screen Lock Gate for Unauthenticated Visitors
  if (!user) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsSubmitting(true);

      try {
        if (tab === 'signin') {
          await signInWithUsernameOrEmail(username, password);
        } else {
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters.');
          }
          await signUpWithUsername(username, password);
        }
      } catch (err: any) {
        console.error(err);
        let msg = err.message || 'Authentication failed.';
        if (msg.includes('auth/operation-not-allowed')) {
          msg = 'Email/Password authentication is not enabled in Firebase Console.';
        } else if (msg.includes('auth/email-already-in-use')) {
          msg = 'Username is already taken. Please choose another username.';
        } else if (
          msg.includes('auth/invalid-credential') ||
          msg.includes('auth/wrong-password') ||
          msg.includes('auth/user-not-found')
        ) {
          msg = 'Invalid username or password.';
        } else if (msg.includes('auth/weak-password')) {
          msg = 'Password should be at least 6 characters.';
        }
        setError(msg);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Grid Pattern & Glowing Orbs */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Lock Screen Card */}
        <div className="relative w-full max-w-md bg-zinc-950/90 border border-zinc-800/90 backdrop-blur-2xl rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.15)] overflow-hidden">
          {/* Glowing Top Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

          {/* Card Header */}
          <div className="p-8 pb-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>CORE ACCESS</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display tracking-tight uppercase">
              mtx-api
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Authentication required to access telemetry features
            </p>
          </div>

          {/* Tab Selector */}
          <div className="px-8 pt-2">
            <div className="grid grid-cols-2 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800/80 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setError(null);
                }}
                className={`py-2.5 rounded-lg transition-all font-mono uppercase tracking-wider border-0 outline-none focus:outline-none select-none ${
                  tab === 'signin'
                    ? 'bg-zinc-800 text-emerald-400 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setError(null);
                }}
                className={`py-2.5 rounded-lg transition-all font-mono uppercase tracking-wider border-0 outline-none focus:outline-none select-none ${
                  tab === 'signup'
                    ? 'bg-zinc-800 text-emerald-400 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  {tab === 'signin' ? 'Username' : 'Choose Username'}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={tab === 'signin' ? 'Enter username' : 'Choose a username'}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors border-0 outline-none focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-mono tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] disabled:opacity-50 mt-4 border-0 outline-none focus:outline-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : tab === 'signin' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>AUTHENTICATE</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>GENERATE ACCOUNT</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render Application UI once Authenticated
  return <>{children}</>;
}
