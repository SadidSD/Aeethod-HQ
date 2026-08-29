import { createClient, RealtimeChannel } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://sxnhywghloehbeiansht.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4bmh5d2dobG9laGJlaWFuc2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDU5NDcsImV4cCI6MjA4NTMyMTk0N30.C4t2Qk7Z5eU5_56pI9WzY5b3K6u9K4y3M7n8P9q1R2s';

export type PlayerRole = 'Founder' | 'Developer' | 'Designer' | 'Marketer' | 'Guest';

export interface LocalPlayerInfo {
  id: string;
  name: string;
  role: PlayerRole;
  color: string;
}

export interface RemotePlayer {
  id: string;
  name: string;
  role: PlayerRole;
  color: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: 'up' | 'down' | 'left' | 'right';
  currentRoom: string;
  activeWorkstation?: string | null;
  lastMessage?: { text: string; timestamp: number };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  role: PlayerRole;
  color: string;
  text: string;
  timestamp: number;
}

export class MultiplayerManager {
  private supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  private channel: RealtimeChannel | null = null;
  public localPlayer: LocalPlayerInfo;
  public remotePlayers = new Map<string, RemotePlayer>();
  public currentRoomId: string | null = null;
  public isConnected = false;

  // Throttling for position updates
  private lastPositionSent = 0;
  private readonly POSITION_SEND_INTERVAL = 60; // ~16 updates/sec (60ms)

  // Callbacks
  public onPlayersUpdate: ((players: Map<string, RemotePlayer>) => void) | null = null;
  public onChatMessage: ((msg: ChatMessage) => void) | null = null;
  public onBoardUpdate: ((type: string, payload: any) => void) | null = null;
  public onConnectionChange: ((connected: boolean, roomId: string | null) => void) | null = null;

  constructor() {
    const savedName = localStorage.getItem('coop_player_name') || 'Founder';
    const savedRole = (localStorage.getItem('coop_player_role') as PlayerRole) || 'Founder';
    const savedColor = localStorage.getItem('coop_player_color') || '#38bdf8';
    const savedId = localStorage.getItem('coop_player_id') || `p_${Math.random().toString(36).slice(2, 9)}`;

    localStorage.setItem('coop_player_id', savedId);

    this.localPlayer = {
      id: savedId,
      name: savedName,
      role: savedRole,
      color: savedColor,
    };
  }

  public updateLocalProfile(name: string, role: PlayerRole, color: string) {
    this.localPlayer.name = name;
    this.localPlayer.role = role;
    this.localPlayer.color = color;
    localStorage.setItem('coop_player_name', name);
    localStorage.setItem('coop_player_role', role);
    localStorage.setItem('coop_player_color', color);

    if (this.channel && this.isConnected) {
      this.channel.track({
        id: this.localPlayer.id,
        name: this.localPlayer.name,
        role: this.localPlayer.role,
        color: this.localPlayer.color,
      });
    }
  }

  public async joinRoom(roomId: string): Promise<boolean> {
    if (this.channel) {
      await this.leaveRoom();
    }

    const cleanRoomId = roomId.trim().toUpperCase();
    this.currentRoomId = cleanRoomId;

    try {
      this.channel = this.supabase.channel(`office:${cleanRoomId}`, {
        config: {
          presence: { key: this.localPlayer.id },
          broadcast: { self: false, ack: false },
        },
      });

      // Handle Presence Sync (who is online in the office)
      this.channel.on('presence', { event: 'sync' }, () => {
        const presenceState = this.channel!.presenceState();
        const activeIds = new Set<string>();

        Object.keys(presenceState).forEach((key) => {
          const presences = presenceState[key] as any[];
          if (presences && presences.length > 0) {
            const data = presences[0];
            if (data.id && data.id !== this.localPlayer.id) {
              activeIds.add(data.id);
              if (!this.remotePlayers.has(data.id)) {
                this.remotePlayers.set(data.id, {
                  id: data.id,
                  name: data.name || 'Teammate',
                  role: data.role || 'Guest',
                  color: data.color || '#38bdf8',
                  x: data.x || 672,
                  y: data.y || 1280,
                  targetX: data.x || 672,
                  targetY: data.y || 1280,
                  facing: 'down',
                  currentRoom: 'Reception',
                });
              } else {
                const existing = this.remotePlayers.get(data.id)!;
                existing.name = data.name || existing.name;
                existing.role = data.role || existing.role;
                existing.color = data.color || existing.color;
              }
            }
          }
        });

        // Remove disconnected players
        for (const id of Array.from(this.remotePlayers.keys())) {
          if (!activeIds.has(id)) {
            this.remotePlayers.delete(id);
          }
        }

        this.onPlayersUpdate?.(new Map(this.remotePlayers));
      });

      // Handle Presence Leave
      this.channel.on('presence', { event: 'leave' }, ({ key }) => {
        if (this.remotePlayers.has(key)) {
          this.remotePlayers.delete(key);
          this.onPlayersUpdate?.(new Map(this.remotePlayers));
        }
      });

      // Handle Broadcast: Player Movement
      this.channel.on('broadcast', { event: 'player_move' }, ({ payload }) => {
        const { id, x, y, facing, currentRoom, activeWorkstation } = payload;
        if (!id || id === this.localPlayer.id) return;

        if (!this.remotePlayers.has(id)) {
          this.remotePlayers.set(id, {
            id,
            name: payload.name || 'Teammate',
            role: payload.role || 'Guest',
            color: payload.color || '#38bdf8',
            x,
            y,
            targetX: x,
            targetY: y,
            facing: facing || 'down',
            currentRoom: currentRoom || 'Reception',
            activeWorkstation,
          });
        } else {
          const player = this.remotePlayers.get(id)!;
          player.targetX = x;
          player.targetY = y;
          player.facing = facing || player.facing;
          player.currentRoom = currentRoom || player.currentRoom;
          player.activeWorkstation = activeWorkstation;
        }

        this.onPlayersUpdate?.(new Map(this.remotePlayers));
      });

      // Handle Broadcast: Chat & Speech Bubbles
      this.channel.on('broadcast', { event: 'chat' }, ({ payload }) => {
        const msg = payload as ChatMessage;
        if (this.remotePlayers.has(msg.senderId)) {
          const p = this.remotePlayers.get(msg.senderId)!;
          p.lastMessage = { text: msg.text, timestamp: Date.now() };
        }
        this.onChatMessage?.(msg);
      });

      // Handle Broadcast: Collaborative Board Updates
      this.channel.on('broadcast', { event: 'board_sync' }, ({ payload }) => {
        this.onBoardUpdate?.(payload.type, payload.data);
      });

      // Subscribe to channel
      await this.channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          this.isConnected = true;
          this.onConnectionChange?.(true, cleanRoomId);

          // Track presence
          await this.channel!.track({
            id: this.localPlayer.id,
            name: this.localPlayer.name,
            role: this.localPlayer.role,
            color: this.localPlayer.color,
          });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.isConnected = false;
          this.onConnectionChange?.(false, null);
        }
      });

      return true;
    } catch (err) {
      console.error('Failed to join co-op room', err);
      this.isConnected = false;
      this.onConnectionChange?.(false, null);
      return false;
    }
  }

  public async leaveRoom() {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    this.remotePlayers.clear();
    this.isConnected = false;
    this.currentRoomId = null;
    this.onConnectionChange?.(false, null);
    this.onPlayersUpdate?.(new Map());
  }

  // Throttle movement sends to ~16 updates per second
  public broadcastPosition(
    x: number,
    y: number,
    facing: 'up' | 'down' | 'left' | 'right',
    currentRoom: string,
    activeWorkstation?: string | null
  ) {
    if (!this.channel || !this.isConnected) return;

    const now = Date.now();
    if (now - this.lastPositionSent < this.POSITION_SEND_INTERVAL) return;
    this.lastPositionSent = now;

    this.channel.send({
      type: 'broadcast',
      event: 'player_move',
      payload: {
        id: this.localPlayer.id,
        name: this.localPlayer.name,
        role: this.localPlayer.role,
        color: this.localPlayer.color,
        x: Math.round(x),
        y: Math.round(y),
        facing,
        currentRoom,
        activeWorkstation,
      },
    });
  }

  public broadcastChat(text: string): ChatMessage | null {
    if (!this.channel || !this.isConnected || !text.trim()) return null;

    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      senderId: this.localPlayer.id,
      senderName: this.localPlayer.name,
      role: this.localPlayer.role,
      color: this.localPlayer.color,
      text: text.trim(),
      timestamp: Date.now(),
    };

    this.channel.send({
      type: 'broadcast',
      event: 'chat',
      payload: msg,
    });

    return msg;
  }

  public broadcastBoardUpdate(type: string, data: any) {
    if (!this.channel || !this.isConnected) return;

    this.channel.send({
      type: 'broadcast',
      event: 'board_sync',
      payload: { type, data },
    });
  }
}

// Singleton export
let multiplayerInstance: MultiplayerManager | null = null;
export function getMultiplayerManager(): MultiplayerManager {
  if (!multiplayerInstance) {
    multiplayerInstance = new MultiplayerManager();
  }
  return multiplayerInstance;
}
