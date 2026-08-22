'use client';

import React from 'react';
import { X, Send, Radio, CheckCircle2 } from 'lucide-react';

interface RemoteInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RemoteInspectModal({ isOpen, onClose }: RemoteInspectModalProps) {
  const [targetName, setTargetName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) return;

    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/v1/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: targetName.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Inspection queued for "${targetName.trim()}". J2ME client will dispatch Packet 93.`);
        setTargetName('');
      } else {
        alert(data.error || 'Failed to queue inspection target');
      }
    } catch (err: any) {
      alert('Error connecting to REST API server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-supabase-card border border-supabase-border rounded-2xl w-full max-w-md shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden font-game">
        {/* Modal Header */}
        <div className="p-5 border-b border-supabase-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-supabase-green/15 border border-supabase-green/40 flex items-center justify-center text-supabase-green">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-pixel text-supabase-green">REMOTE TARGET INSPECTOR</h3>
              <p className="text-[10px] text-supabase-muted">Dispatch Packet 93 via REST Bridge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-supabase-muted hover:text-supabase-text hover:bg-supabase-border/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-pixel text-supabase-subtle mb-2">
              TARGET CHARACTER NAME
            </label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="e.g. manixstar"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-supabase-bg border border-supabase-border focus:border-supabase-green focus:outline-none text-supabase-text text-xs font-pixel placeholder:text-supabase-subtle"
            />
          </div>

          {successMsg && (
            <div className="p-3 rounded-lg bg-supabase-green/10 border border-supabase-green/30 flex items-start space-x-2 text-xs text-supabase-green">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-supabase-border text-xs text-supabase-muted hover:text-supabase-text font-game"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading || !targetName.trim()}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-supabase-green text-black font-pixel text-[10px] hover:bg-supabase-greenHover transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'QUEUING...' : 'DISPATCH REQUEST'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
