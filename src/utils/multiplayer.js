import { io } from 'socket.io-client';

class MultiplayerClient {
  constructor() {
    this.socket = null;
    this.channel = null;
    this.roomCode = null;
    this.playerNumber = 1;
    this.playerName = '';
    this.callbacks = {};
    this.isSocketConnected = false;
  }

  getBackendUrl() {
    if (typeof window === 'undefined') return 'http://localhost:3001';
    if (import.meta.env.VITE_BACKEND_URL) {
      return import.meta.env.VITE_BACKEND_URL;
    }
    // If running on dev localhost, connect to port 3001
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    // If deployed on Vercel with a remote backend, fallback to window.location.origin
    return window.location.origin;
  }

  initSocket() {
    if (this.socket) return this.socket;

    const url = this.getBackendUrl();
    console.log('Connecting to game server at:', url);

    try {
      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        timeout: 4000
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to FC Clash Game Server:', this.socket.id);
        this.isSocketConnected = true;
        if (this.callbacks.onServerStatus) {
          this.callbacks.onServerStatus('Connected to Game Server');
        }
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from Game Server');
        this.isSocketConnected = false;
      });

      this.socket.on('connect_error', (err) => {
        console.warn('Socket server connection note (using fallback peer sync):', err.message);
        this.isSocketConnected = false;
      });

      // Game event listeners
      this.socket.on('game-started', (data) => {
        console.log('Game started from server:', data);
        if (this.callbacks.onGameStarted) this.callbacks.onGameStarted(data);
      });

      this.socket.on('round-revealed', (data) => {
        if (this.callbacks.onRoundRevealed) this.callbacks.onRoundRevealed(data);
      });

      this.socket.on('round-advanced', (data) => {
        if (this.callbacks.onRoundAdvanced) this.callbacks.onRoundAdvanced(data);
      });

      this.socket.on('player-left', (data) => {
        if (this.callbacks.onPlayerLeft) this.callbacks.onPlayerLeft(data);
      });
    } catch (e) {
      console.warn('Socket init error:', e);
    }

    return this.socket;
  }

  // Cross-tab broadcast fallback
  initBroadcast(roomCode) {
    if (this.channel) {
      this.channel.close();
    }
    this.channel = new BroadcastChannel(`fc-room-${roomCode}`);
    this.channel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      console.log('Broadcast received:', data.type);
      if (data.type === 'GUEST_JOINED_LOCAL') {
        if (this.callbacks.onLocalGuestJoined) this.callbacks.onLocalGuestJoined(data);
      } else if (data.type === 'GAME_SYNC_LOCAL') {
        if (this.callbacks.onGameStarted) this.callbacks.onGameStarted(data.payload);
      } else if (data.type === 'SELECT_ATTRIBUTE_LOCAL') {
        if (this.callbacks.onLocalSelectAttribute) this.callbacks.onLocalSelectAttribute(data.attribute);
      } else if (data.type === 'NEXT_ROUND_LOCAL') {
        if (this.callbacks.onLocalNextRound) this.callbacks.onLocalNextRound();
      }
    };
  }

  createRoom({ playerName, deckSize }, onResult) {
    this.playerName = playerName;
    this.playerNumber = 1;
    this.initSocket();

    // 1. Try server socket
    if (this.socket && this.socket.connected) {
      this.socket.emit('create-room', { playerName, deckSize }, (res) => {
        if (res && res.success) {
          this.roomCode = res.roomCode;
          this.initBroadcast(res.roomCode);
          // Store in localStorage for cross-tab discoverability
          try {
            localStorage.setItem(`fc_room_${res.roomCode}`, JSON.stringify({
              roomCode: res.roomCode,
              hostName: playerName,
              deckSize,
              createdAt: Date.now()
            }));
          } catch (e) {}

          if (onResult) onResult({ success: true, roomCode: res.roomCode });
        } else {
          this.createLocalFallbackRoom({ playerName, deckSize }, onResult);
        }
      });
      return;
    }

    // 2. Fallback local room generator
    this.createLocalFallbackRoom({ playerName, deckSize }, onResult);
  }

  createLocalFallbackRoom({ playerName, deckSize }, onResult) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));

    this.roomCode = code;
    this.initBroadcast(code);

    try {
      localStorage.setItem(`fc_room_${code}`, JSON.stringify({
        roomCode: code,
        hostName: playerName,
        deckSize,
        createdAt: Date.now()
      }));
    } catch (e) {}

    if (onResult) onResult({ success: true, roomCode: code });
  }

  joinRoom({ roomCode, playerName }, onResult) {
    const code = (roomCode || '').toUpperCase().trim();
    this.roomCode = code;
    this.playerName = playerName;
    this.playerNumber = 2;
    this.initSocket();

    // 1. Try server socket first
    if (this.socket && this.socket.connected) {
      this.socket.emit('join-room', { roomCode: code, playerName }, (res) => {
        if (res && res.success) {
          this.initBroadcast(code);
          if (onResult) onResult({ success: true, roomCode: code, playerNumber: 2 });
        } else {
          // If server says not found, check local cross-tab fallback
          this.joinLocalFallbackRoom({ roomCode: code, playerName }, onResult, res?.error);
        }
      });
      return;
    }

    // 2. If socket not connected, check local fallback directly
    this.joinLocalFallbackRoom({ roomCode: code, playerName }, onResult);
  }

  joinLocalFallbackRoom({ roomCode, playerName }, onResult, serverError) {
    this.initBroadcast(roomCode);

    // Check localStorage room
    let stored = null;
    try {
      const item = localStorage.getItem(`fc_room_${roomCode}`);
      if (item) stored = JSON.parse(item);
    } catch (e) {}

    if (stored) {
      // Signal host via BroadcastChannel
      this.channel.postMessage({
        type: 'GUEST_JOINED_LOCAL',
        guestName: playerName,
        roomCode
      });

      if (onResult) onResult({ success: true, roomCode, isLocal: true });
    } else {
      // If neither server nor local room found
      if (onResult) onResult({
        success: false,
        error: serverError || `Room "${roomCode}" not found. Please check code or ask Host for new room.`
      });
    }
  }

  chooseAttribute(attribute) {
    if (this.socket && this.socket.connected && this.roomCode) {
      this.socket.emit('choose-attribute', {
        roomCode: this.roomCode,
        attribute
      });
    }
    if (this.channel) {
      this.channel.postMessage({
        type: 'SELECT_ATTRIBUTE_LOCAL',
        attribute
      });
    }
  }

  nextRound() {
    if (this.socket && this.socket.connected && this.roomCode) {
      this.socket.emit('next-round', { roomCode: this.roomCode });
    }
    if (this.channel) {
      this.channel.postMessage({ type: 'NEXT_ROUND_LOCAL' });
    }
  }

  sendLocalGameSync(payload) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'GAME_SYNC_LOCAL',
        payload
      });
    }
  }

  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
}

export const multiplayer = new MultiplayerClient();
