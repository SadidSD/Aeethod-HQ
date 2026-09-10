import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type PlayerRole = 'Founder' | 'Developer' | 'Designer' | 'Marketer' | 'Guest';

export interface CharacterSetup {
  skinTone: string;
  hairStyle: 'classic' | 'spiky' | 'fade' | 'bun' | 'cyber_visor' | 'executive_cap';
  hairColor: string;
  outfit: 'executive_suit' | 'kitty_hoodie' | 'spider_jacket' | 'studio_turtleneck' | 'emerald_trench';
  auraColor: string;
  accessory: 'none' | 'coffee' | 'laptop' | 'hologram' | 'contract' | 'vip_badge';
  title: string;
}

export interface LocalPlayerInfo {
  id: string;
  name: string;
  role: PlayerRole;
  color: string;
  character: CharacterSetup;
}

export interface RemotePlayer {
  id: string;
  name: string;
  role: PlayerRole;
  color: string;
  character?: CharacterSetup;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: 'up' | 'down' | 'left' | 'right';
  currentRoom: string;
  activeWorkstation?: string | null;
  lastMessage?: { text: string; timestamp: number };
  lastSeen?: number;
  isTabActive?: boolean;
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
  private supabase = supabase;
  private channel: RealtimeChannel | null = null;
  public localPlayer: LocalPlayerInfo;
  public remotePlayers = new Map<string, RemotePlayer>();
  public currentRoomId: string | null = null;
  public isConnected = false;
  private pruneInterval: any = null;
  private heartbeatInterval: any = null;

  // Track local player's latest known coordinates & tab visibility
  public lastKnownPosition = {
    x: 672,
    y: 1280,
    facing: 'down' as 'up' | 'down' | 'left' | 'right',
    currentRoom: 'Reception',
    activeWorkstation: null as string | null,
    isTabActive: true,
  };

  // Throttling for position updates
  private lastPositionSent = 0;
  private readonly POSITION_SEND_INTERVAL = 60; // ~16 updates/sec (60ms)

  // Callbacks
  public onPlayersUpdate: ((players: Map<string, RemotePlayer>) => void) | null = null;
  public onChatMessage: ((msg: ChatMessage) => void) | null = null;
  public onBoardUpdate: ((type: string, payload: any) => void) | null = null;
  public onConnectionChange: ((connected: boolean, roomId: string | null) => void) | null = null;

  constructor() {
    const savedName = localStorage.getItem('coop_player_name') || '';
    const savedRole = (localStorage.getItem('coop_player_role') as PlayerRole) || 'Founder';
    const savedColor = localStorage.getItem('coop_player_color') || '#f59e0b';
    
    // Unique ID per browser tab to avoid ghost conflicts between multiple open tabs/refreshes
    let tabId = sessionStorage.getItem('coop_tab_session_id');
    if (!tabId) {
      tabId = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem('coop_tab_session_id', tabId);
    }

    let savedChar: CharacterSetup = {
      skinTone: '#ffdbac',
      hairStyle: 'classic',
      hairColor: '#0f172a',
      outfit: 'executive_suit',
      auraColor: '#f59e0b',
      accessory: 'coffee',
      title: 'Founder & CEO',
    };

    try {
      const stored = localStorage.getItem('aeethod_character_setup');
      if (stored) savedChar = JSON.parse(stored);
    } catch (e) {}

    this.localPlayer = {
      id: tabId,
      name: savedName,
      role: savedRole,
      color: savedColor,
      character: savedChar,
    };

    // Clean disconnect on page reload or tab close
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.leaveRoom();
      });

      // Handle tab visibility change so player stays visible when on another tab
      document.addEventListener('visibilitychange', () => {
        const isActive = !document.hidden;
        this.lastKnownPosition.isTabActive = isActive;
        if (this.channel && this.isConnected) {
          this.sendHeartbeat(isActive);
          if (isActive) {
            this.refreshPresence();
          }
        }
      });
    }

    // Auto-prune truly disconnected players without dropping players who are tabbed out
    this.pruneInterval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const presenceState = this.channel ? this.channel.presenceState() : {};
      const activePresenceKeys = new Set(Object.keys(presenceState));

      for (const [id, rp] of Array.from(this.remotePlayers.entries())) {
        // If player is still actively reported in Supabase presence, keep them!
        if (activePresenceKeys.has(id)) continue;

        // If not in Supabase presence AND hasn't sent any heartbeat for > 45s, prune
        if (rp.lastSeen && now - rp.lastSeen > 45000) {
          this.remotePlayers.delete(id);
          changed = true;
        }
      }
      if (changed) {
        this.onPlayersUpdate?.(new Map(this.remotePlayers));
      }
    }, 4000);
  }

  public updateLocalProfile(name: string, role: PlayerRole, color: string, character?: CharacterSetup) {
    this.localPlayer.name = name;
    this.localPlayer.role = role;
    this.localPlayer.color = color;
    if (character) {
      this.localPlayer.character = character;
      localStorage.setItem('aeethod_character_setup', JSON.stringify(character));
    }
    localStorage.setItem('coop_player_name', name);
    localStorage.setItem('coop_player_role', role);
    localStorage.setItem('coop_player_color', color);

    if (this.channel && this.isConnected) {
      this.channel.track({
        id: this.localPlayer.id,
        name: this.localPlayer.name,
        role: this.localPlayer.role,
        color: this.localPlayer.color,
        character: this.localPlayer.character,
        x: this.lastKnownPosition.x,
        y: this.lastKnownPosition.y,
        facing: this.lastKnownPosition.facing,
        currentRoom: this.lastKnownPosition.currentRoom,
        activeWorkstation: this.lastKnownPosition.activeWorkstation,
        isTabActive: typeof document !== 'undefined' ? !document.hidden : true,
        lastActive: Date.now(),
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
        const now = Date.now();

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
                  character: data.character,
                  x: data.x || 672,
                  y: data.y || 1280,
                  targetX: data.x || 672,
                  targetY: data.y || 1280,
                  facing: data.facing || 'down',
                  currentRoom: data.currentRoom || 'Reception',
                  activeWorkstation: data.activeWorkstation,
                  lastSeen: now,
                  isTabActive: data.isTabActive !== false,
                });
              } else {
                const existing = this.remotePlayers.get(data.id)!;
                existing.name = data.name || existing.name;
                existing.role = data.role || existing.role;
                existing.color = data.color || existing.color;
                if (data.character) existing.character = data.character;
                if (data.isTabActive !== undefined) existing.isTabActive = data.isTabActive;
                if (data.x !== undefined && data.y !== undefined) {
                  existing.targetX = data.x;
                  existing.targetY = data.y;
                }
                existing.lastSeen = now;
              }
            }
          }
        });

        // Remove truly disconnected players (not present in presence AND unseen for > 30s)
        for (const [id, player] of Array.from(this.remotePlayers.entries())) {
          if (!activeIds.has(id) && (!player.lastSeen || now - player.lastSeen > 30000)) {
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
        const { id, x, y, facing, currentRoom, activeWorkstation, character, name, role, color, isTabActive } = payload;
        if (!id || id === this.localPlayer.id) return;
        const now = Date.now();

        if (!this.remotePlayers.has(id)) {
          this.remotePlayers.set(id, {
            id,
            name: name || payload.name || 'Teammate',
            role: role || payload.role || 'Guest',
            color: color || payload.color || '#38bdf8',
            character,
            x: x ?? 672,
            y: y ?? 1280,
            targetX: x ?? 672,
            targetY: y ?? 1280,
            facing: facing || 'down',
            currentRoom: currentRoom || 'Reception',
            activeWorkstation,
            lastSeen: now,
            isTabActive: isTabActive !== false,
          });
        } else {
          const player = this.remotePlayers.get(id)!;
          if (x !== undefined && y !== undefined) {
            player.targetX = x;
            player.targetY = y;
          }
          player.facing = facing || player.facing;
          player.currentRoom = currentRoom || player.currentRoom;
          player.activeWorkstation = activeWorkstation;
          if (character) player.character = character;
          if (name) player.name = name;
          if (role) player.role = role;
          if (color) player.color = color;
          player.isTabActive = isTabActive !== false;
          player.lastSeen = now;
        }

        this.onPlayersUpdate?.(new Map(this.remotePlayers));
      });

      // Handle Broadcast: Player Heartbeat (keeps player visible while AFK or on another browser tab)
      this.channel.on('broadcast', { event: 'player_heartbeat' }, ({ payload }) => {
        const { id, x, y, facing, currentRoom, activeWorkstation, character, name, role, color, isTabActive } = payload;
        if (!id || id === this.localPlayer.id) return;
        const now = Date.now();

        if (!this.remotePlayers.has(id)) {
          this.remotePlayers.set(id, {
            id,
            name: name || 'Teammate',
            role: role || 'Guest',
            color: color || '#38bdf8',
            character,
            x: x ?? 672,
            y: y ?? 1280,
            targetX: x ?? 672,
            targetY: y ?? 1280,
            facing: facing || 'down',
            currentRoom: currentRoom || 'Reception',
            activeWorkstation,
            lastSeen: now,
            isTabActive: isTabActive !== false,
          });
        } else {
          const player = this.remotePlayers.get(id)!;
          if (x !== undefined && y !== undefined) {
            player.targetX = x;
            player.targetY = y;
          }
          if (facing) player.facing = facing;
          if (currentRoom) player.currentRoom = currentRoom;
          if (activeWorkstation !== undefined) player.activeWorkstation = activeWorkstation;
          if (character) player.character = character;
          if (name) player.name = name;
          if (role) player.role = role;
          if (color) player.color = color;
          player.isTabActive = isTabActive !== false;
          player.lastSeen = now;
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

          // Track presence with coordinates and tab state
          await this.channel!.track({
            id: this.localPlayer.id,
            name: this.localPlayer.name,
            role: this.localPlayer.role,
            color: this.localPlayer.color,
            character: this.localPlayer.character,
            x: this.lastKnownPosition.x,
            y: this.lastKnownPosition.y,
            facing: this.lastKnownPosition.facing,
            currentRoom: this.lastKnownPosition.currentRoom,
            activeWorkstation: this.lastKnownPosition.activeWorkstation,
            isTabActive: typeof document !== 'undefined' ? !document.hidden : true,
            lastActive: Date.now(),
          });

          // Start continuous background heartbeat (every 3 seconds)
          if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
          this.heartbeatInterval = setInterval(() => {
            if (this.isConnected && this.channel) {
              this.sendHeartbeat();
            }
          }, 3000);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.isConnected = false;
          this.onConnectionChange?.(false, null);
        }
      });

      return true;
    } catch (err) {
      console.error('Failed to join room', err);
      this.isConnected = false;
      this.onConnectionChange?.(false, null);
      return false;
    }
  }

  public async leaveRoom() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
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

  // Send lightweight heartbeat to keep player visible while AFK or tabbed out
  public sendHeartbeat(isTabActive = typeof document !== 'undefined' ? !document.hidden : true) {
    if (!this.channel || !this.isConnected) return;
    this.lastKnownPosition.isTabActive = isTabActive;

    this.channel.send({
      type: 'broadcast',
      event: 'player_heartbeat',
      payload: {
        id: this.localPlayer.id,
        name: this.localPlayer.name,
        role: this.localPlayer.role,
        color: this.localPlayer.color,
        character: this.localPlayer.character,
        x: this.lastKnownPosition.x,
        y: this.lastKnownPosition.y,
        facing: this.lastKnownPosition.facing,
        currentRoom: this.lastKnownPosition.currentRoom,
        activeWorkstation: this.lastKnownPosition.activeWorkstation,
        isTabActive,
        timestamp: Date.now(),
      },
    });
  }

  // Refresh presence status on tab focus
  public async refreshPresence() {
    if (this.channel && this.isConnected) {
      try {
        await this.channel.track({
          id: this.localPlayer.id,
          name: this.localPlayer.name,
          role: this.localPlayer.role,
          color: this.localPlayer.color,
          character: this.localPlayer.character,
          x: this.lastKnownPosition.x,
          y: this.lastKnownPosition.y,
          facing: this.lastKnownPosition.facing,
          currentRoom: this.lastKnownPosition.currentRoom,
          activeWorkstation: this.lastKnownPosition.activeWorkstation,
          isTabActive: typeof document !== 'undefined' ? !document.hidden : true,
          lastActive: Date.now(),
        });
      } catch (e) {
        console.warn('Failed to refresh presence:', e);
      }
    }
  }

  // Throttle movement sends to ~16 updates per second
  public broadcastPosition(
    x: number,
    y: number,
    facing: 'up' | 'down' | 'left' | 'right',
    currentRoom: string,
    activeWorkstation?: string | null
  ) {
    // Record current position for heartbeats
    this.lastKnownPosition.x = Math.round(x);
    this.lastKnownPosition.y = Math.round(y);
    this.lastKnownPosition.facing = facing;
    this.lastKnownPosition.currentRoom = currentRoom;
    if (activeWorkstation !== undefined) {
      this.lastKnownPosition.activeWorkstation = activeWorkstation;
    }
    this.lastKnownPosition.isTabActive = typeof document !== 'undefined' ? !document.hidden : true;

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
        character: this.localPlayer.character,
        x: this.lastKnownPosition.x,
        y: this.lastKnownPosition.y,
        facing,
        currentRoom,
        activeWorkstation: this.lastKnownPosition.activeWorkstation,
        isTabActive: this.lastKnownPosition.isTabActive,
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
