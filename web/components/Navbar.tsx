'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, Activity, Search, MessageSquare, FileText, LogIn, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';

interface NavbarProps {
  playerCount?: number;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Navbar({ playerCount = 0 }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [modClientOnline, setModClientOnline] = useState<boolean>(false);
  const [livePlayerCount, setLivePlayerCount] = useState<number>(playerCount);
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/v1/status');
        if (res.ok) {
          const data = await res.json();
          setModClientOnline(!!data.modClientOnline);
          if (typeof data.playerCount === 'number') {
            setLivePlayerCount(data.playerCount);
          }
        }
      } catch (e) {
        setModClientOnline(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: Activity },
    { id: 'inspector', label: 'Inspector', href: '/inspector', icon: Search },
    { id: 'chat', label: 'Live Chat', href: '/chat', icon: MessageSquare },
    { id: 'docs', label: 'API Docs', href: '/docs', icon: FileText },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:border-emerald-500/40 transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-extrabold text-base tracking-tight text-white uppercase group-hover:text-emerald-400 transition-colors">
                  mtx-api
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-zinc-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-900 text-emerald-400 font-semibold border border-zinc-800'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Status Pill & Auth (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-mono">
              {modClientOnline ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-400 font-bold text-[11px] tracking-wide">CLIENT ONLINE</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                  </span>
                  <span className="text-zinc-400 font-medium text-[11px] tracking-wide">CLIENT OFFLINE</span>
                </>
              )}
              <span className="text-zinc-800">|</span>
              <span className="text-zinc-300 font-medium text-[11px]">{livePlayerCount} TARGETS</span>
            </div>

            {/* Authentication Action Button / Profile */}
            {loading ? (
              <div className="w-20 h-8 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-5 h-5 rounded-full border border-emerald-500/40 object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium max-w-[100px] truncate text-[11px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-zinc-900 mb-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {user.displayName || 'User Profile'}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-xs font-mono font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>SIGN IN</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono">
              {modClientOnline ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                  </span>
                  <span className="text-rose-400 font-semibold">OFFLINE</span>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/80 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-800 bg-black/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-3 animate-fade-in">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-900 text-emerald-400 font-semibold border border-zinc-800'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-zinc-900">
              {user ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono text-white truncate">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="p-1.5 rounded text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold"
                >
                  <LogIn className="w-4 h-4" />
                  <span>SIGN IN TO PORTAL</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal Component */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
