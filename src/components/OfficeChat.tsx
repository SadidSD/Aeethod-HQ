import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ChevronDown, ChevronUp, Smile } from 'lucide-react';
import { MultiplayerManager, ChatMessage } from '../core/multiplayer';

interface OfficeChatProps {
  multiplayer: MultiplayerManager;
  onRefresh: () => void;
}

const QUICK_EMOJIS = ['👋', '🚀', '💡', '🔥', '☕', '👀'];

export default function OfficeChat({ multiplayer, onRefresh }: OfficeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Hook into multiplayer chat messages
  useEffect(() => {
    multiplayer.onChatMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev.slice(-49), msg]);
      onRefresh();
    };
  }, [multiplayer, onRefresh]);

  // Scroll to bottom
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  // Global enter key to open chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isExpanded) {
        setIsExpanded(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const handleSend = (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content) return;

    const sent = multiplayer.broadcastChat(content);
    if (sent) {
      setMessages((prev) => [...prev.slice(-49), sent]);
    }
    setInputText('');
    onRefresh();
  };

  if (!multiplayer.isConnected) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 font-mono text-xs select-text">
      {/* Expanded Chat Box */}
      {isExpanded ? (
        <div className="w-80 bg-[#0c1219]/95 border border-cyan-500/40 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#101820] border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Office Comms [{multiplayer.currentRoomId}]</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="p-3 space-y-2 h-44 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-[11px] italic">
                No messages yet. Say hello to the office!
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === multiplayer.localPlayer.id;
                return (
                  <div key={m.id} className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="font-bold" style={{ color: m.color || '#38bdf8' }}>
                        {m.senderName}
                      </span>
                      <span className="text-slate-500 font-mono">[{m.role}]</span>
                      <span className="text-[9px] text-slate-600 ml-auto">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-1.5 rounded text-slate-200 leading-snug break-words ${isMe ? 'bg-cyan-950/40 border border-cyan-500/20' : 'bg-slate-900/80 border border-slate-800'}`}>
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reaction Emojis */}
          <div className="px-2 py-1 bg-[#090e13] border-t border-slate-800/80 flex items-center gap-1">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSend(emoji)}
                className="p-1 hover:bg-slate-800 rounded text-sm transition transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2 bg-[#101820] border-t border-slate-800 flex items-center gap-1.5"
          >
            <input
              autoFocus
              placeholder="Press Enter to send..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#0c1219] border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition"
            >
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      ) : (
        /* Collapsed pill */
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#0c1219]/90 hover:bg-[#101820] border border-cyan-500/40 text-cyan-300 rounded-full shadow-lg backdrop-blur-sm transition group"
        >
          <MessageSquare className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold">Press [Enter] to Chat</span>
          {messages.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
              {messages.length}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
