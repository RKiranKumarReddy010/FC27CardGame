import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Load players dataset
const playersPath = path.join(__dirname, '..', 'src', 'data', 'players.json');
let playersData = [];
try {
  playersData = JSON.parse(fs.readFileSync(playersPath, 'utf-8'));
  console.log(`Loaded ${playersData.length} cards into backend memory.`);
} catch (e) {
  console.error('Error loading players.json in backend:', e);
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Rooms storage
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function dealCards(deckSize) {
  // Only deal initially; never shuffle once dealt
  const shuffled = [...playersData].sort(() => 0.5 - Math.random());
  const p1Cards = shuffled.slice(0, deckSize);
  const p2Cards = shuffled.slice(deckSize, deckSize * 2);
  return { p1Cards, p2Cards };
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Create Room
  socket.on('create-room', ({ playerName, deckSize = 10 }, callback) => {
    let roomCode = generateRoomCode();
    while (rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const room = {
      code: roomCode,
      deckSize: Number(deckSize) || 10,
      hostId: socket.id,
      players: [
        {
          id: socket.id,
          name: playerName || 'Player 1',
          playerNumber: 1,
          isHost: true
        }
      ],
      gameState: null,
      status: 'waiting_for_player'
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);
    console.log(`Room created: ${roomCode} by ${playerName} (${socket.id})`);

    if (callback) {
      callback({
        success: true,
        roomCode,
        playerNumber: 1
      });
    }
  });

  // Join Room
  socket.on('join-room', ({ roomCode, playerName }, callback) => {
    const code = (roomCode || '').toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      if (callback) callback({ success: false, error: 'Room not found. Check code and try again.' });
      return;
    }

    if (room.players.length >= 2) {
      if (callback) callback({ success: false, error: 'Room is already full.' });
      return;
    }

    const newPlayer = {
      id: socket.id,
      name: playerName || 'Player 2',
      playerNumber: 2,
      isHost: false
    };

    room.players.push(newPlayer);
    room.status = 'playing';
    socket.join(code);

    // Deal fresh decks (strict no-shuffle queue rule during play)
    const { p1Cards, p2Cards } = dealCards(room.deckSize);

    room.gameState = {
      player1Deck: p1Cards,
      player2Deck: p2Cards,
      warPot: [],
      roundNumber: 1,
      activePlayer: 1, // Player 1 starts
      roundStatus: 'choosing',
      selectedAttribute: null,
      roundWinner: null,
      roundResultText: '',
      turnResultText: '',
      isGameOver: false,
      matchWinner: null
    };

    console.log(`Player 2 (${playerName}) joined room: ${code}. Starting match!`);

    if (callback) {
      callback({
        success: true,
        roomCode: code,
        playerNumber: 2
      });
    }

    // Broadcast match start to all in room
    io.to(code).emit('game-started', {
      roomCode: code,
      players: room.players,
      gameState: room.gameState
    });
  });

  // Choose Attribute (Only active player can choose)
  socket.on('choose-attribute', ({ roomCode, attribute }) => {
    const code = (roomCode || '').toUpperCase();
    const room = rooms.get(code);
    if (!room || !room.gameState) return;

    const { gameState, players } = room;
    if (gameState.roundStatus !== 'choosing') return;

    // Verify caller
    const caller = players.find(p => p.playerNumber === gameState.activePlayer);
    if (!caller || caller.id !== socket.id) {
      console.warn(`Unauthorized call attempt by ${socket.id} in room ${code}`);
      return;
    }

    const p1Card = gameState.player1Deck[0];
    const p2Card = gameState.player2Deck[0];
    if (!p1Card || !p2Card) return;

    const p1Val = p1Card.stats[attribute];
    const p2Val = p2Card.stats[attribute];
    const p1Name = players[0]?.name || 'Player 1';
    const p2Name = players[1]?.name || 'Player 2';
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

    console.log(`Room ${code} clash: ${attribute} (P1: ${p1Val} vs P2: ${p2Val}) -> Winner: ${gameState.roundWinner}`);

    io.to(code).emit('round-revealed', { gameState });
  });

  // Next Round progression (strict no-shuffle queues)
  socket.on('next-round', ({ roomCode }) => {
    const code = (roomCode || '').toUpperCase();
    const room = rooms.get(code);
    if (!room || !room.gameState) return;

    const { gameState, players } = room;
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
      nextActive = 1; // Winner gets another chance to choose!
    } else if (gameState.roundWinner === 2) {
      nextP2Deck = [...p2Remaining, p2Card, p1Card, ...gameState.warPot];
      nextWarPot = [];
      nextActive = 2; // Winner gets another chance to choose!
    } else {
      nextWarPot = [...gameState.warPot, p1Card, p2Card];
      nextActive = gameState.activePlayer; // Same chooser continues
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

    // Check game over
    if (nextP1Deck.length === 0) {
      gameState.isGameOver = true;
      gameState.matchWinner = players[1]?.name || 'Player 2';
    } else if (nextP2Deck.length === 0) {
      gameState.isGameOver = true;
      gameState.matchWinner = players[0]?.name || 'Player 1';
    }

    io.to(code).emit('round-advanced', { gameState });
  });

  // Rematch / Restart in same room
  socket.on('rematch', ({ roomCode }) => {
    const code = (roomCode || '').toUpperCase();
    const room = rooms.get(code);
    if (!room) return;

    const { p1Cards, p2Cards } = dealCards(room.deckSize);
    room.gameState = {
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

    io.to(code).emit('game-started', {
      roomCode: code,
      players: room.players,
      gameState: room.gameState
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    for (const [code, room] of rooms.entries()) {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        const leavingPlayer = room.players[idx];
        room.players.splice(idx, 1);
        io.to(code).emit('player-left', {
          message: `${leavingPlayer.name} has left the match.`,
          players: room.players
        });
        if (room.players.length === 0) {
          rooms.delete(code);
          console.log(`Cleaned up empty room ${code}`);
        }
      }
    }
  });
});

// REST Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'FC Clash Top Trumps Backend',
    activeRooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// Serve frontend if in production build
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`⚽ FC Clash Multiplayer Game Server running on port ${PORT}`);
});
