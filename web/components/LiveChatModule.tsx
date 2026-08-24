'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, RefreshCw, Trash2, Send, MessageCircle, Globe, Users, User, ArrowRight, ShieldAlert } from 'lucide-react';
import { ChatMessage } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';

export function LiveChatModule() {
  const { user } = useAuth();
  const userId = user?.uid || user?.email || 'guest';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userPmMessages, setUserPmMessages] = useState<ChatMessage[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Outbound Web Chat Dispatch State
  const [outboundChannel, setOutboundChannel] = useState<'MAP' | 'WORLD' | 'PRIVATE' | 'CLAN'>('MAP');
  const [outboundRecipient, setOutboundRecipient] = useState('');
  const [outboundMessage, setOutboundMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  // Fetch account PM messages from userStore API
  const fetchUserPmMessages = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/v1/user/pm-chats?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setUserPmMessages(data.pmMessages || []);
      }
    } catch (e) {
      console.warn('Error loading user PM logs:', e);
    }
  }, [userId]);

  const fetchChatMessages = useCallback(async () => {
    try {
      const url = selectedChannel === 'ALL' ? '/api/v1/chat' : `/api/v1/chat?channel=${selectedChannel}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Error fetching chat messages:', e);
    }
    fetchUserPmMessages();
  }, [selectedChannel, fetchUserPmMessages]);

  useEffect(() => {
    fetchChatMessages();
  }, [fetchChatMessages]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchChatMessages]);

  const handleClearHistory = async () => {
    if (selectedChannel === 'PRIVATE') {
      if (!confirm('Are you sure you want to clear your saved 100 PM message history?')) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/user/pm-chats?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
        if (res.ok) {
          setUserPmMessages([]);
        }
      } catch (e) {
        console.error('Error clearing PM history:', e);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!confirm('Are you sure you want to clear the global live chat feed?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/chat', { method: 'DELETE' });
      if (res.ok) {
        setMessages([]);
      }
    } catch (e) {
      console.error('Error clearing chat history:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOutboundMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outboundMessage.trim()) return;
    if (outboundChannel === 'PRIVATE' && !outboundRecipient.trim()) {
      alert('Please enter a recipient name for Private Messages.');
      return;
    }

    setSending(true);
    setSendStatus(null);
    try {
      const cleanMessage = outboundMessage.trim();
      const cleanRecipient = outboundRecipient.trim();

      const res = await fetch('/api/v1/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: outboundChannel,
          recipient: cleanRecipient,
          message: cleanMessage,
        }),
      });

      if (res.ok) {
        // If PM message, save to user account store (FIFO 100 cap)
        if (outboundChannel === 'PRIVATE') {
          await fetch('/api/v1/user/pm-chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              sender: 'WEB_CONSOLE',
              recipient: cleanRecipient,
              message: cleanMessage,
            }),
          });
        }

        setOutboundMessage('');
        setSendStatus('Dispatched to game!');
        fetchChatMessages();
        setTimeout(() => setSendStatus(null), 4000);
      } else {
        const data = await res.json();
        alert(`Failed to send chat: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const getChannelBadge = (channel: ChatMessage['channel']) => {
    switch (channel) {
      case 'MAP':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded flex items-center space-x-1 shrink-0">
            <MessageCircle className="w-3 h-3" />
            <span>PUBLIC</span>
          </span>
        );
      case 'WORLD':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded flex items-center space-x-1 shrink-0">
            <Globe className="w-3 h-3" />
            <span>GLOBAL</span>
          </span>
        );
      case 'PRIVATE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded flex items-center space-x-1 shrink-0">
            <User className="w-3 h-3" />
            <span>PM</span>
          </span>
        );
      case 'CLAN':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded flex items-center space-x-1 shrink-0">
            <Users className="w-3 h-3" />
            <span>CLAN</span>
          </span>
        );
      default:
        return null;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const channels = [
    { id: 'ALL', label: 'All Channels' },
    { id: 'MAP', label: 'Public' },
    { id: 'WORLD', label: 'Global' },
    { id: 'PRIVATE', label: `PM (${userPmMessages.length}/100)` },
    { id: 'CLAN', label: 'Clan' },
  ];

  // Determine active feed
  const activeFeed = selectedChannel === 'PRIVATE' ? userPmMessages : messages;

  const getChannelPlaceholder = () => {
    switch (outboundChannel) {
      case 'MAP': return 'Type public chat message...';
      case 'WORLD': return 'Type global chat message...';
      case 'PRIVATE': return 'Type private PM message...';
      case 'CLAN': return 'Type clan chat message...';
      default: return 'Type message...';
    }
  };

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Module Controls Bar */}
      <div className="p-3 sm:p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl flex flex-col gap-3">
        {/* Top Controls Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono text-xs font-bold text-zinc-200 truncate">CHAT CONSOLE</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                autoRefresh
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
              <span className="hidden xs:inline">{autoRefresh ? 'LIVE' : 'PAUSED'}</span>
            </button>

            <button
              onClick={fetchChatMessages}
              className="p-1.5 rounded-lg bg-zinc-800/80 text-zinc-300 hover:text-white border border-zinc-700/50 transition-colors"
              title="Refresh Messages"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
              title={selectedChannel === 'PRIVATE' ? 'Clear Account PM Logs (Max 100)' : 'Clear Chat Feed'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Channel Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all shrink-0 ${
                selectedChannel === ch.id
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Stream Terminal Box */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden shadow-2xl flex flex-col">
        {/* Terminal Sub-header */}
        <div className="px-3 py-2.5 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">
            {selectedChannel === 'PRIVATE' ? 'ACCOUNT PM LOGS (MAX 100 RECENT)' : 'FEED TELEMETRY'}
          </span>
          <span className="text-zinc-500 text-[11px]">{activeFeed.length} LOGS</span>
        </div>

        {/* Message Log Feed */}
        <div className="p-3 sm:p-4 max-h-[420px] overflow-y-auto space-y-2 font-mono text-xs">
          {activeFeed.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-zinc-400 text-xs font-sans">
                {selectedChannel === 'PRIVATE' ? 'No saved private PM messages' : 'No chat messages intercepted yet'}
              </p>
              <p className="text-zinc-600 text-[11px] max-w-xs mx-auto font-mono">
                {selectedChannel === 'PRIVATE'
                  ? 'Your user-initiated PM messages will save here (max 100 recent).'
                  : 'Messages from the J2ME mod client stream here in real time.'}
              </p>
            </div>
          ) : (
            activeFeed.map((msg) => (
              <div
                key={msg.id}
                className="p-2.5 sm:p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/80 transition-all flex flex-col gap-1 min-w-0"
              >
                {/* Meta Row: Badge + Time + Sender info */}
                <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
                  <div className="flex items-center space-x-2 min-w-0 flex-wrap">
                    {getChannelBadge(msg.channel)}
                    <span className="text-white font-bold truncate max-w-[120px] sm:max-w-[180px]">{msg.sender}</span>
                    {msg.recipient && (
                      <span className="flex items-center space-x-1 text-purple-400 text-[11px] truncate">
                        <ArrowRight className="w-3 h-3 text-zinc-600 inline shrink-0" />
                        <span className="font-semibold">{msg.recipient}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-zinc-500 text-[10px] shrink-0 font-mono">{formatTime(msg.timestamp)}</span>
                </div>

                {/* Content Row */}
                <p className="text-zinc-200 font-sans text-xs leading-relaxed break-words pl-0.5">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Outbound Web Chat Command Bar */}
        <form onSubmit={handleSendOutboundMessage} className="p-3 bg-zinc-900/90 border-t border-zinc-800/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center space-x-1.5 min-w-0">
              <Send className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="font-semibold text-zinc-300 truncate text-[11px]">OUTBOUND COMMAND DISPATCH</span>
            </div>
            {sendStatus && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 animate-pulse">
                ✓ {sendStatus}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            {/* Options bar: Channel + Recipient */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={outboundChannel}
                onChange={(e) => setOutboundChannel(e.target.value as any)}
                className="flex-1 sm:flex-none px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 shrink-0"
              >
                <option value="MAP">PUBLIC CHAT</option>
                <option value="WORLD">GLOBAL CHAT</option>
                <option value="PRIVATE">PRIVATE PM</option>
                <option value="CLAN">CLAN CHAT</option>
              </select>

              {outboundChannel === 'PRIVATE' && (
                <input
                  type="text"
                  placeholder="Recipient..."
                  value={outboundRecipient}
                  onChange={(e) => setOutboundRecipient(e.target.value)}
                  className="w-28 sm:w-36 px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-purple-300 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 shrink-0"
                />
              )}
            </div>

            {/* Input & Dispatch Button Row */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="text"
                placeholder={getChannelPlaceholder()}
                value={outboundMessage}
                onChange={(e) => setOutboundMessage(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />

              <button
                type="submit"
                disabled={sending || !outboundMessage.trim()}
                className="px-3.5 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-mono font-semibold flex items-center justify-center space-x-1.5 transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className={`w-3.5 h-3.5 ${sending ? 'animate-bounce' : ''}`} />
                <span className="hidden sm:inline">SEND</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
