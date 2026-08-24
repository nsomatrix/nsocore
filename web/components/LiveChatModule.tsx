'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, RefreshCw, Trash2, Send, MessageCircle, Globe, Users, User } from 'lucide-react';
import { ChatMessage } from '@/lib/store';

export function LiveChatModule() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Outbound Web Chat Dispatch State
  const [outboundChannel, setOutboundChannel] = useState<'MAP' | 'WORLD' | 'PRIVATE' | 'CLAN'>('MAP');
  const [outboundRecipient, setOutboundRecipient] = useState('');
  const [outboundMessage, setOutboundMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

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
  }, [selectedChannel]);

  useEffect(() => {
    fetchChatMessages();
  }, [fetchChatMessages]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchChatMessages]);

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear the live chat log history?')) return;
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
      const res = await fetch('/api/v1/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: outboundChannel,
          recipient: outboundRecipient.trim(),
          message: outboundMessage.trim(),
        }),
      });

      if (res.ok) {
        setOutboundMessage('');
        setSendStatus('Queued for game dispatch!');
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
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded flex items-center space-x-1">
            <MessageCircle className="w-3 h-3" />
            <span>MAP</span>
          </span>
        );
      case 'WORLD':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded flex items-center space-x-1">
            <Globe className="w-3 h-3" />
            <span>WORLD</span>
          </span>
        );
      case 'PRIVATE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>WHISPER</span>
          </span>
        );
      case 'CLAN':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded flex items-center space-x-1">
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
    { id: 'MAP', label: 'Map Chat' },
    { id: 'WORLD', label: 'World Chat' },
    { id: 'PRIVATE', label: 'Whispers' },
    { id: 'CLAN', label: 'Clan Chat' },
  ];

  return (
    <div className="space-y-6">
      {/* Module Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl">
        {/* Channel Selection Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedChannel === ch.id
                  ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              autoRefresh
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
            <span>{autoRefresh ? 'AUTO SYNC ON' : 'PAUSED'}</span>
          </button>

          <button
            onClick={fetchChatMessages}
            className="p-2 rounded-lg bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700/80 border border-zinc-700/50 transition-colors"
            title="Refresh Messages"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleClearHistory}
            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
            title="Clear Chat Logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Stream Terminal Box */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-semibold text-zinc-300">LIVE CHAT TELEMETRY STREAM</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">{messages.length} MESSAGES LOGGED</span>
        </div>

        {/* Message Log Feed */}
        <div className="p-4 max-h-[480px] overflow-y-auto space-y-3 font-mono text-xs divide-y divide-zinc-900">
          {messages.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-zinc-400 text-sm font-sans">No chat messages intercepted yet</p>
              <p className="text-zinc-600 text-xs max-w-md mx-auto font-mono">
                Messages sent or received by the J2ME mod client will stream here in real time.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-900/30 p-2 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  {getChannelBadge(msg.channel)}
                  <span className="text-zinc-500 text-[11px]">{formatTime(msg.timestamp)}</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-white font-bold">{msg.sender}</span>
                    {msg.recipient && (
                      <>
                        <span className="text-zinc-600">➔</span>
                        <span className="text-purple-400 font-semibold">{msg.recipient}</span>
                      </>
                    )}
                    <span className="text-zinc-500">:</span>
                  </div>
                  <span className="text-zinc-200 font-sans text-sm">{msg.message}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Outbound Web Chat Command Bar */}
        <form onSubmit={handleSendOutboundMessage} className="p-4 bg-zinc-900/90 border-t border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-xs font-semibold text-zinc-300">DISPATCH GAME CHAT MESSAGE</span>
            </div>
            {sendStatus && (
              <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 animate-pulse">
                ✓ {sendStatus}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {/* Channel Dropdown */}
            <select
              value={outboundChannel}
              onChange={(e) => setOutboundChannel(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="MAP">MAP CHAT (-23)</option>
              <option value="WORLD">WORLD CHAT (-21)</option>
              <option value="PRIVATE">WHISPER PM (-22)</option>
              <option value="CLAN">CLAN CHAT (-19)</option>
            </select>

            {/* Target Recipient Input (if PRIVATE) */}
            {outboundChannel === 'PRIVATE' && (
              <input
                type="text"
                placeholder="Recipient name..."
                value={outboundRecipient}
                onChange={(e) => setOutboundRecipient(e.target.value)}
                className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-purple-300 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 w-full sm:w-44"
              />
            )}

            {/* Message Input */}
            <input
              type="text"
              placeholder={`Type ${outboundChannel.toLowerCase()} message to send via game client...`}
              value={outboundMessage}
              onChange={(e) => setOutboundMessage(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={sending || !outboundMessage.trim()}
              className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-mono font-semibold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className={`w-3.5 h-3.5 ${sending ? 'animate-bounce' : ''}`} />
              <span>SEND TO GAME</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
