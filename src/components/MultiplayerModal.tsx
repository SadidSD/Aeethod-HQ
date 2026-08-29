import React, { useState, useEffect } from 'react';
import {
  Globe,
  Users,
  Copy,
  Check,
  LogOut,
  X,
  Sparkles,
  Shield,
  Palette,
  User,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { MultiplayerManager, PlayerRole, RemotePlayer } from '../core/multiplayer';

interface MultiplayerModalProps {
  multiplayer: MultiplayerManager;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const ROLES: PlayerRole[] = ['Founder', 'Developer', 'Designer', 'Marketer', 'Guest'];

const AVATAR_COLORS = [
  { name: 'Sky Blue', hex: '#38bdf8' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Cyan', hex: '#06b6d4' },
];

export default function MultiplayerModal({
  multiplayer,
  isOpen,
  onClose,
  onRefresh,
}: MultiplayerModalProps) {
  const [roomInput, setRoomInput] = useState(multiplayer.currentRoomId || 'TCG-OFFICE');
  const [nameInput, setNameInput] = useState(multiplayer.localPlayer.name);
  const [roleInput, setRoleInput] = useState<PlayerRole>(multiplayer.localPlayer.role);
  const [colorInput, setColorInput] = useState(multiplayer.localPlayer.color);
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConnect = async (targetRoom?: string) => {
    const target = (targetRoom || roomInput || 'TCG-OFFICE').trim().toUpperCase();
    setIsJoining(true);
    multiplayer.updateLocalProfile(nameInput.trim() || 'Player', roleInput, colorInput);
    const success = await multiplayer.joinRoom(target);
    setIsJoining(false);
    if (success) {
      onRefresh();
    }
  };

  const handleDisconnect = async () => {
    await multiplayer.leaveRoom();
    onRefresh();
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${multiplayer.currentRoomId || roomInput}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in font-mono text-xs">
      <div className="relative w-full max-w-lg bg-[#0c1219] border border-cyan-500/50 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#101820] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-cyan-400" />
            <span className="font-bold tracking-wide text-cyan-400 uppercase">
              🌐 Co-Op Office Multiplayer
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Status Banner */}
          <div
            className={`p-3 rounded-lg border flex items-center justify-between ${
              multiplayer.isConnected
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    multiplayer.isConnected ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    multiplayer.isConnected ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}
                />
              </span>
              <div>
                <span className="font-bold text-slate-200">
                  {multiplayer.isConnected
                    ? `Connected to Room: [${multiplayer.currentRoomId}]`
                    : 'Offline / Single Player Mode'}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {multiplayer.isConnected
                    ? `${multiplayer.remotePlayers.size + 1} players walking in the office`
                    : 'Join or host a room to walk with team members'}
                </span>
              </div>
            </div>

            {multiplayer.isConnected && (
              <button
                onClick={handleDisconnect}
                className="px-2.5 py-1 bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded text-[11px] font-bold flex items-center gap-1 transition"
              >
                <LogOut className="h-3 w-3" />
                Leave
              </button>
            )}
          </div>

          {/* Player Profile Setup */}
          <div className="bg-[#101820] border border-slate-800 p-3.5 rounded-lg space-y-3">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5 text-xs text-cyan-400">
              <User className="h-3.5 w-3.5" />
              <span>Your Avatar & Role in Office</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                  Name / Handle
                </label>
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Sadid"
                  className="w-full bg-[#0c1219] border border-slate-700 rounded p-1.5 text-xs text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                  Office Role
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as PlayerRole)}
                  className="w-full bg-[#0c1219] border border-slate-700 rounded p-1.5 text-xs text-slate-100"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5 flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Suit Color
              </label>
              <div className="flex items-center gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setColorInput(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`h-6 w-6 rounded-full border-2 transition-transform ${
                      colorInput === c.hex
                        ? 'border-white scale-110 shadow-sm'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Room Controls */}
          {!multiplayer.isConnected ? (
            <div className="space-y-3 bg-[#101820] border border-slate-800 p-3.5 rounded-lg">
              <h4 className="font-bold text-slate-300 flex items-center gap-1.5 text-xs text-cyan-400">
                <Radio className="h-3.5 w-3.5" />
                <span>Join or Host an Office Room</span>
              </h4>

              <div className="flex items-center gap-2">
                <input
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                  placeholder="ROOM-CODE (e.g. TCG-OFFICE)"
                  className="flex-1 bg-[#0c1219] border border-slate-700 rounded p-2 text-xs text-slate-100 font-bold uppercase tracking-wider"
                />
                <button
                  disabled={isJoining}
                  onClick={() => handleConnect()}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>{isJoining ? 'Connecting...' : 'Connect'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const randomCode = `OFFICE-${Math.floor(1000 + Math.random() * 9000)}`;
                    setRoomInput(randomCode);
                    handleConnect(randomCode);
                  }}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold transition"
                >
                  ⚡ Create Random Private Office
                </button>
              </div>
            </div>
          ) : (
            /* Connected Room Details & Roster */
            <div className="space-y-3 bg-[#101820] border border-slate-800 p-3.5 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Invite Link for Teammates
                  </span>
                  <span className="text-cyan-400 font-bold">
                    Room: {multiplayer.currentRoomId}
                  </span>
                </div>
                <button
                  onClick={copyShareLink}
                  className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded text-[11px] font-bold flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied Link!' : 'Copy Invite Link'}</span>
                </button>
              </div>

              {/* Teammates Roster */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Active in Office ({multiplayer.remotePlayers.size + 1})
                </span>

                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {/* You */}
                  <div className="flex items-center justify-between p-1.5 bg-[#0c1219] rounded border border-cyan-500/30 text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: multiplayer.localPlayer.color }}
                      />
                      <span className="font-bold text-slate-200">
                        {multiplayer.localPlayer.name} (You)
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        [{multiplayer.localPlayer.role}]
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Host / Active</span>
                  </div>

                  {/* Remote players */}
                  {Array.from(multiplayer.remotePlayers.values()).map((rp) => (
                    <div
                      key={rp.id}
                      className="flex items-center justify-between p-1.5 bg-[#0c1219] rounded border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: rp.color }}
                        />
                        <span className="font-medium text-slate-300">{rp.name}</span>
                        <span className="text-[10px] text-slate-500">[{rp.role}]</span>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        {rp.currentRoom || 'Office'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#101820] border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
          <span>Press ESC to return to game</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
