import { io } from 'socket.io-client';
import * as PeerModule from 'peerjs';
import playersData from '../data/players.json';

const Peer = PeerModule.Peer || PeerModule.default || PeerModule;

const PEER_PREFIX = 'fc27clash-';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' }
];

class MultiplayerClient {
  constructor() {
    this.socket = null;
    this.peer = null;
    this.conn = null;
    this.channel = null;
    this.roomCode = null;
    this.isHost = false;
    this.playerName = '';
    this.playerNumber = 1;
    this.deckSize = 10;
    this.callbacks = {};
    this.isSocketConnected = false;
    this.p2pGameState = null;
    this.players = [];
  }

  getBackendUrl() {
    if (typeof window === 'undefined') return 'http://localhost:3001';
    if (import.meta.env.VITE_BACKEND_URL) {
      return import.meta.env.VITE_BACKEND_URL;
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    return window.location.origin;
  }

  initSocket() {
    if (this.socket) return this.socket;

    const url = this.getBackendUrl();
    try {
      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 3,
        timeout: 2500
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to FC Clash Game Server:', this.socket.id);
        this.isSocketConnected = true;
        if (this.callbacks.onServerStatus) {
          this.callbacks.onServerStatus('Connected to Dedicated Server');
        }
      });

      this.socket.on('disconnect', () => {
        this.isSocketConnected = false;
      });

      this.socket.on('connect_error', () => {
        this.isSocketConnected = false;
      });

      this.socket.on('game-started', (data) => {
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
      console.warn('Socket server not reachable, using WebRTC P2P mesh:', e);
    }

    return this.socket;
  }

  initBroadcast(roomCode) {
    if (this.channel) {
      try { this.channel.close(); } catch (e) {}
    }
    try {
      this.channel = new BroadcastChannel(`fc-room-${roomCode}`);
      this.channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;
        this.handleIncomingP2P(data);
      };
    } catch (e) {}
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  dealCards(deckSize = 10) {
    const shuffled = [...playersData].sort(() => 0.5 - Math.random());
    const p1Cards = shuffled.slice(0, deckSize);
    const p2Cards = shuffled.slice(deckSize, deckSize * 2);
    return { p1Cards, p2Cards };
  }

  cleanupConnections() {
    if (this.conn) {
      try { this.conn.close(); } catch (e) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
    if (this.channel) {
      try { this.channel.close(); } catch (e) {}
      this.channel = null;
    }
  }

  createRoom({ playerName, deckSize = 10 }, onResult) {
    this.playerName = playerName || 'Player 1';
    this.deckSize = Number(deckSize) || 10;
    this.playerNumber = 1;
    this.isHost = true;
    this.cleanupConnections();

    const code = this.generateRoomCode();
    this.roomCode = code;

    // 1. Cross-tab fallback
    this.initBroadcast(code);
    try {
      localStorage.setItem(`fc_room_${code}`, JSON.stringify({
        roomCode: code,
        hostName: this.playerName,
        deckSize: this.deckSize,
        createdAt: Date.now()
      }));
    } catch (e) {}

    // 2. WebRTC P2P Host (PeerJS)
    this.initHostPeer(code, onResult);

    // 3. Optional Socket.io server
    this.initSocket();
    if (this.socket && this.socket.connected) {
      this.socket.emit('create-room', { playerName: this.playerName, deckSize: this.deckSize }, (res) => {
        if (res && res.success) {
          console.log('Socket server room registered:', res.roomCode);
        }
      });
    }
  }

  initHostPeer(code, onResult) {
    const peerId = `${PEER_PREFIX}${code.toLowerCase()}`;
    console.log('Initializing WebRTC Host Peer:', peerId);

    try {
      this.peer = new Peer(peerId, {
        config: { iceServers: ICE_SERVERS },
        debug: 1
      });

      let callbackTriggered = false;

      this.peer.on('open', (id) => {
        console.log('✅ Host Peer active on WebRTC cloud mesh:', id);
        if (this.callbacks.onServerStatus) {
          this.callbacks.onServerStatus('Ready for Player 2 (P2P Cloud)');
        }
        if (!callbackTriggered && onResult) {
          callbackTriggered = true;
          onResult({ success: true, roomCode: code });
        }
      });

      this.peer.on('connection', (conn) => {
        console.log('🔗 Guest connected to Host via WebRTC!');
        this.conn = conn;

        conn.on('open', () => {
          console.log('WebRTC DataChannel opened with Guest');
        });

        conn.on('data', (data) => {
          this.handleIncomingP2P(data);
        });

        conn.on('close', () => {
          console.log('Guest disconnected');
          if (this.callbacks.onPlayerLeft) {
            this.callbacks.onPlayerLeft({ message: 'Player 2 disconnected from match.' });
          }
        });

        conn.on('error', (err) => {
          console.warn('Guest connection error:', err);
        });
      });

      this.peer.on('error', (err) => {
        console.warn('Host peer event:', err);
        if (err.type === 'unavailable-id') {
          console.log('Peer ID collision, generating fresh room code...');
          this.cleanupConnections();
          const newCode = this.generateRoomCode();
          this.roomCode = newCode;
          this.initHostPeer(newCode, onResult);
          return;
        }

        if (!callbackTriggered && onResult) {
          callbackTriggered = true;
          onResult({ success: true, roomCode: code });
        }
      });
    } catch (e) {
      console.error('Peer init error:', e);
      if (onResult) onResult({ success: true, roomCode: code });
    }
  }

  checkLocalFallback(roomCode) {
    try {
      const item = localStorage.getItem(`fc_room_${roomCode}`);
      return !!item;
    } catch (e) {
      return false;
    }
  }

  connectLocalGuest(code, onResult) {
    console.log('Connecting via local cross-tab fallback...');
    this.initBroadcast(code);
    this.sendP2P({
      type: 'GUEST_JOINED',
      guestName: this.playerName,
      roomCode: code
    });
    if (onResult) onResult({ success: true, roomCode: code, playerNumber: 2 });
  }

  joinRoom({ roomCode, playerName }, onResult) {
    const code = (roomCode || '').toUpperCase().trim();
    this.roomCode = code;
    this.playerName = playerName || 'Player 2';
    this.playerNumber = 2;
    this.isHost = false;
    this.cleanupConnections();

    console.log(`Connecting to room ${code} as ${this.playerName}`);

    // If socket server is active, try it first
    this.initSocket();
    if (this.socket && this.socket.connected) {
      this.socket.emit('join-room', { roomCode: code, playerName: this.playerName }, (res) => {
        if (res && res.success) {
          this.initBroadcast(code);
          if (onResult) onResult({ success: true, roomCode: code, playerNumber: 2 });
          return;
        }
        this.joinViaPeer(code, onResult);
      });
      return;
    }

    // Connect via PeerJS WebRTC P2P
    this.joinViaPeer(code, onResult);
  }

  joinViaPeer(code, onResult) {
    const hostPeerId = `${PEER_PREFIX}${code.toLowerCase()}`;
    const hasLocalRoom = this.checkLocalFallback(code);
    let resolved = false;

    try {
      this.peer = new Peer({
        config: { iceServers: ICE_SERVERS },
        debug: 1
      });

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (hasLocalRoom) {
            this.connectLocalGuest(code, onResult);
          } else {
            if (onResult) onResult({
              success: false,
              error: `Room "${code}" not found. Verify the code with Host and ensure Host is waiting in lobby.`
            });
          }
        }
      }, 7000);

      this.peer.on('open', (id) => {
        console.log(`Guest Peer online (${id}). Connecting to Host (${hostPeerId})...`);
        const conn = this.peer.connect(hostPeerId, { reliable: true });
        this.conn = conn;

        conn.on('open', () => {
          console.log('✅ Connected to Host via WebRTC DataChannel!');
          clearTimeout(timeout);
          if (!resolved) {
            resolved = true;
            this.initBroadcast(code);
            conn.send({
              type: 'GUEST_JOINED',
              guestName: this.playerName,
              roomCode: code
            });
            if (onResult) onResult({ success: true, roomCode: code, playerNumber: 2 });
          }
        });

        conn.on('data', (data) => {
          this.handleIncomingP2P(data);
        });

        conn.on('close', () => {
          console.log('Host connection closed');
          if (this.callbacks.onPlayerLeft) {
            this.callbacks.onPlayerLeft({ message: 'Host has closed or left the room.' });
          }
        });

        conn.on('error', (err) => {
          console.warn('Peer connection error:', err);
        });
      });

      this.peer.on('error', (err) => {
        console.warn('Guest peer error event:', err);
        clearTimeout(timeout);
        if (!resolved) {
          resolved = true;
          if (hasLocalRoom) {
            this.connectLocalGuest(code, onResult);
          } else {
            if (onResult) {
              onResult({
                success: false,
                error: `Room "${code}" not found. Verify the code with Host and ensure Host has created the room.`
              });
            }
          }
        }
      });
    } catch (e) {
      console.error('Peer connection exception:', e);
      if (hasLocalRoom) {
        this.connectLocalGuest(code, onResult);
      } else {
        if (onResult) onResult({
          success: false,
          error: `Room "${code}" not found. Please check code or ask Host for a new room.`
        });
      }
    }
  }

  handleIncomingP2P(data) {
    if (!data) return;

    switch (data.type) {
      case 'GUEST_JOINED': {
        if (!this.isHost) return;
        const guestName = data.guestName || 'Player 2';
        console.log(`Player 2 (${guestName}) joined! Starting match...`);

        const { p1Cards, p2Cards } = this.dealCards(this.deckSize);

        this.players = [
          { name: this.playerName || 'Player 1', playerNumber: 1, isHost: true },
          { name: guestName, playerNumber: 2, isHost: false }
        ];

        this.p2pGameState = {
          player1Deck: p1Cards,
          player2Deck: p2Cards,
          warPot: [],
          roundNumber: 1,
          activePlayer: 1,
          roundStatus: 'choosing',
          selectedAttribute: null,
          roundWinner: null,
          roundResultText: '',
          turnResultText: '',
          isGameOver: false,
          matchWinner: null
        };

        const payload = {
          roomCode: this.roomCode,
          players: this.players,
          gameState: this.p2pGameState
        };

        if (this.callbacks.onGameStarted) {
          this.callbacks.onGameStarted(payload);
        }

        this.sendP2P({
          type: 'GAME_STARTED',
          payload
        });
        break;
      }

      case 'GAME_STARTED': {
        if (this.callbacks.onGameStarted) {
          this.callbacks.onGameStarted(data.payload);
        }
        break;
      }

      case 'CHOOSE_ATTRIBUTE': {
        if (this.isHost) {
          this.evaluateAttributeChoice(data.attribute);
        }
        break;
      }

      case 'ROUND_REVEALED': {
        if (this.callbacks.onRoundRevealed) {
          this.callbacks.onRoundRevealed({ gameState: data.gameState });
        }
        break;
      }

      case 'NEXT_ROUND': {
        if (this.isHost) {
          this.advanceRound();
        }
        break;
      }

      case 'ROUND_ADVANCED': {
        if (this.callbacks.onRoundAdvanced) {
          this.callbacks.onRoundAdvanced({ gameState: data.gameState });
        }
        break;
      }

      case 'REMATCH': {
        if (this.isHost) {
          this.rematch();
        }
        break;
      }

      case 'PLAYER_LEFT': {
        if (this.callbacks.onPlayerLeft) {
          this.callbacks.onPlayerLeft({ message: data.message || 'Opponent left the match.' });
        }
        break;
      }
    }
  }

  evaluateAttributeChoice(attribute) {
    if (!this.p2pGameState) return;
    const gameState = this.p2pGameState;
    if (gameState.roundStatus !== 'choosing') return;

    const p1Card = gameState.player1Deck[0];
    const p2Card = gameState.player2Deck[0];
    if (!p1Card || !p2Card) return;

    const p1Val = p1Card.stats[attribute];
    const p2Val = p2Card.stats[attribute];
    const p1Name = this.players[0]?.name || 'Player 1';
    const p2Name = this.players[1]?.name || 'Player 2';
    const attrUpper = attribute.toUpperCase();

    gameState.selectedAttribute = attribute;
    gameState.roundStatus = 'revealed';

    if (p1Val > p2Val) {
      gameState.roundWinner = 1;
      gameState.roundResultText = `🔥 ${p1Card.name} (${p1Val} ${attrUpper}) beats ${p2Card.name} (${p2Val} ${attrUpper})!`;
      if (gameState.activePlayer === 1) {
        gameState.turnResultText = `🎉 ${p1Name} wins & gets another chance to choose!`;
      } else {
        gameState.turnResultText = `⚡ ${p1Name} wins & takes the call from ${p2Name}!`;
      }
    } else if (p2Val > p1Val) {
      gameState.roundWinner = 2;
      gameState.roundResultText = `⚡ ${p2Card.name} (${p2Val} ${attrUpper}) beats ${p1Card.name} (${p1Val} ${attrUpper})!`;
      if (gameState.activePlayer === 2) {
        gameState.turnResultText = `🎉 ${p2Name} wins & gets another chance to choose!`;
      } else {
        gameState.turnResultText = `⚡ ${p2Name} wins & takes the call from ${p1Name}!`;
      }
    } else {
      gameState.roundWinner = 'tie';
      gameState.roundResultText = `⚔️ Stalemate! Both cards matched with ${p1Val} ${attrUpper}!`;
      gameState.turnResultText = `Cards added to the War Pot. ${gameState.activePlayer === 1 ? p1Name : p2Name} calls from the next card!`;
    }

    if (this.callbacks.onRoundRevealed) {
      this.callbacks.onRoundRevealed({ gameState });
    }

    this.sendP2P({
      type: 'ROUND_REVEALED',
      gameState
    });
  }

  advanceRound() {
    if (!this.p2pGameState) return;
    const gameState = this.p2pGameState;
    if (gameState.roundStatus !== 'revealed') return;

    const p1Card = gameState.player1Deck[0];
    const p2Card = gameState.player2Deck[0];
    if (!p1Card || !p2Card) return;

    const p1Remaining = gameState.player1Deck.slice(1);
    const p2Remaining = gameState.player2Deck.slice(1);

    let nextP1Deck = [...p1Remaining];
    let nextP2Deck = [...p2Remaining];
    let nextWarPot = [...gameState.warPot];
    let nextActive = gameState.activePlayer;

    if (gameState.roundWinner === 1) {
      nextP1Deck = [...p1Remaining, p1Card, p2Card, ...gameState.warPot];
      nextWarPot = [];
      nextActive = 1;
    } else if (gameState.roundWinner === 2) {
      nextP2Deck = [...p2Remaining, p2Card, p1Card, ...gameState.warPot];
      nextWarPot = [];
      nextActive = 2;
    } else {
      nextWarPot = [...gameState.warPot, p1Card, p2Card];
      nextActive = gameState.activePlayer;
    }

    gameState.player1Deck = nextP1Deck;
    gameState.player2Deck = nextP2Deck;
    gameState.warPot = nextWarPot;
    gameState.roundNumber += 1;
    gameState.activePlayer = nextActive;
    gameState.roundStatus = 'choosing';
    gameState.selectedAttribute = null;
    gameState.roundWinner = null;
    gameState.roundResultText = '';
    gameState.turnResultText = '';

    if (nextP1Deck.length === 0) {
      gameState.isGameOver = true;
      gameState.matchWinner = this.players[1]?.name || 'Player 2';
    } else if (nextP2Deck.length === 0) {
      gameState.isGameOver = true;
      gameState.matchWinner = this.players[0]?.name || 'Player 1';
    }

    if (this.callbacks.onRoundAdvanced) {
      this.callbacks.onRoundAdvanced({ gameState });
    }

    this.sendP2P({
      type: 'ROUND_ADVANCED',
      gameState
    });
  }

  chooseAttribute(attribute) {
    if (this.socket && this.socket.connected && this.roomCode) {
      this.socket.emit('choose-attribute', {
        roomCode: this.roomCode,
        attribute
      });
      return;
    }

    if (this.isHost) {
      this.evaluateAttributeChoice(attribute);
    } else {
      this.sendP2P({
        type: 'CHOOSE_ATTRIBUTE',
        attribute
      });
    }
  }

  nextRound() {
    if (this.socket && this.socket.connected && this.roomCode) {
      this.socket.emit('next-round', { roomCode: this.roomCode });
      return;
    }

    if (this.isHost) {
      this.advanceRound();
    } else {
      this.sendP2P({
        type: 'NEXT_ROUND'
      });
    }
  }

  rematch() {
    if (this.socket && this.socket.connected && this.roomCode) {
      this.socket.emit('rematch', { roomCode: this.roomCode });
      return;
    }

    if (this.isHost) {
      const { p1Cards, p2Cards } = this.dealCards(this.deckSize);
      this.p2pGameState = {
        player1Deck: p1Cards,
        player2Deck: p2Cards,
        warPot: [],
        roundNumber: 1,
        activePlayer: 1,
        roundStatus: 'choosing',
        selectedAttribute: null,
        roundWinner: null,
        roundResultText: '',
        turnResultText: '',
        isGameOver: false,
        matchWinner: null
      };

      const payload = {
        roomCode: this.roomCode,
        players: this.players,
        gameState: this.p2pGameState
      };

      if (this.callbacks.onGameStarted) {
        this.callbacks.onGameStarted(payload);
      }
      this.sendP2P({
        type: 'GAME_STARTED',
        payload
      });
    } else {
      this.sendP2P({ type: 'REMATCH' });
    }
  }

  sendP2P(data) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(data);
      } catch (e) {
        console.warn('WebRTC send failed:', e);
      }
    }
    if (this.channel) {
      try {
        this.channel.postMessage(data);
      } catch (e) {}
    }
  }

  sendLocalGameSync(payload) {
    this.sendP2P({
      type: 'GAME_STARTED',
      payload
    });
  }

  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
}

export const multiplayer = new MultiplayerClient();
