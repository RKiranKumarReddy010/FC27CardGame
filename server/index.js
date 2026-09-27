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

    const tossWinner = Math.random() < 0.5 ? 1 : 2;

    room.gameState = {
      player1Deck: p1Cards,
      player2Deck: p2Cards,
      player1Score: 0,
      player2Score: 0,
      totalDuels: room.deckSize,
      roundNumber: 1,
      activePlayer: tossWinner,
      currentPicker: tossWinner,
      tossWinner,
      duelPicks: [],
      usedAttributes: [],
      roundStatus: 'choosing',
      selectedAttribute: null,
      roundWinner: null,
      roundResultText: '',
      turnResultText: '',
      isGameOver: false,
      matchWinner: null
    };

    console.log(`Player 2 (${playerName}) joined room: ${code}. Starting match with toss winner: P${tossWinner}`);

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

  // Choose Attribute (Pick 1 by Caller -> Pick 2 by Opponent -> Pick 3 by Caller)
  socket.on('choose-attribute', ({ roomCode, attribute }) => {
    const code = (roomCode || '').toUpperCase();
    const room = rooms.get(code);
    if (!room || !room.gameState) return;

    const { gameState, players } = room;
    if (gameState.roundStatus !== 'choosing') return;
    if (gameState.usedAttributes && gameState.usedAttributes.includes(attribute)) return;

    // Verify current picker
    const currentPickerNum = gameState.currentPicker || gameState.activePlayer;
    const pickerPlayer = players.find(p => p.playerNumber === currentPickerNum);
    if (!pickerPlayer || pickerPlayer.id !== socket.id) {
      console.warn(`Unauthorized pick attempt by ${socket.id} (expected P${currentPickerNum}) in room ${code}`);
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

    const pickWinner = p1Val > p2Val ? 1 : p2Val > p1Val ? 2 : 'tie';

    if (!gameState.duelPicks) gameState.duelPicks = [];
    if (!gameState.usedAttributes) gameState.usedAttributes = [];

    const pickObj = {
      attribute,
      picker: currentPickerNum,
      p1Val,
      p2Val,
      winner: pickWinner
    };

    gameState.duelPicks.push(pickObj);
    gameState.usedAttributes.push(attribute);
    gameState.selectedAttribute = attribute;

    const pickNum = gameState.duelPicks.length;

    if (pickNum < 3) {
      // Pick 1 -> Opponent picks next; Pick 2 -> Caller picks next
      const nextPicker = pickNum === 1
        ? (gameState.activePlayer === 1 ? 2 : 1)
        : gameState.activePlayer;

      gameState.currentPicker = nextPicker;
      gameState.roundStatus = 'choosing';

      const winnerName = pickWinner === 1 ? p1Name : pickWinner === 2 ? p2Name : 'Draw';
      gameState.roundResultText = `Pick ${pickNum}/3 (${attrUpper}): ${p1Name} (${p1Val}) vs ${p2Name} (${p2Val}) -> ${winnerName} takes clash!`;
      gameState.turnResultText = `Pick ${pickNum + 1}/3: ${nextPicker === 1 ? p1Name : p2Name}'s turn to choose attribute!`;

      io.to(code).emit('pick-resolved', { gameState });
      return;
    }

    // All 3 picks complete -> Determine Duel Winner
    let p1Wins = 0;
    let p2Wins = 0;
    gameState.duelPicks.forEach((p) => {
      if (p.winner === 1) p1Wins++;
      else if (p.winner === 2) p2Wins++;
    });

    gameState.roundStatus = 'revealed';

    if (p1Wins > p2Wins) {
      gameState.roundWinner = 1;
      gameState.player1Score = (gameState.player1Score || 0) + 1;
      gameState.roundResultText = `🎉 ${p1Name} won Duel ${gameState.roundNumber} (${p1Wins} - ${p2Wins})! (+1 Pt)`;
      gameState.turnResultText = `${p1Name} retains call advantage for Duel ${gameState.roundNumber + 1}!`;
    } else if (p2Wins > p1Wins) {
      gameState.roundWinner = 2;
      gameState.player2Score = (gameState.player2Score || 0) + 1;
      gameState.roundResultText = `🎉 ${p2Name} won Duel ${gameState.roundNumber} (${p2Wins} - ${p1Wins})! (+1 Pt)`;
      gameState.turnResultText = `${p2Name} takes call advantage for Duel ${gameState.roundNumber + 1}!`;
    } else {
      gameState.roundWinner = 'tie';
      gameState.roundResultText = `⚔️ Duel ${gameState.roundNumber} ended in a Draw (${p1Wins} - ${p2Wins})!`;
      gameState.turnResultText = `Stalemate (0 pts). Call stays with ${gameState.activePlayer === 1 ? p1Name : p2Name}!`;
    }

    io.to(code).emit('round-revealed', { gameState });
  });

  // Next Round progression (consumes 1 card per duel; winner calls next)
  socket.on('next-round', ({ roomCode }) => {
    const code = (roomCode || '').toUpperCase();
    const room = rooms.get(code);
    if (!room || !room.gameState) return;

    const { gameState, players } = room;
    if (gameState.roundStatus !== 'revealed') return;

    const p1Remaining = gameState.player1Deck.slice(1);
    const p2Remaining = gameState.player2Deck.slice(1);

    gameState.player1Deck = p1Remaining;
    gameState.player2Deck = p2Remaining;

    // Check if match concluded (25 duels complete)
    if (p1Remaining.length === 0 || p2Remaining.length === 0) {
      gameState.isGameOver = true;
      const s1 = gameState.player1Score || 0;
      const s2 = gameState.player2Score || 0;
      if (s1 > s2) {
        gameState.matchWinner = players[0]?.name || 'Player 1';
      } else if (s2 > s1) {
        gameState.matchWinner = players[1]?.name || 'Player 2';
      } else {
        gameState.matchWinner = 'Honorable Draw';
      }
    } else {
      // Winner of previous duel becomes next active player/caller!
      const nextActive = gameState.roundWinner === 1 ? 1 : gameState.roundWinner === 2 ? 2 : gameState.activePlayer;
      gameState.roundNumber += 1;
      gameState.activePlayer = nextActive;
      gameState.currentPicker = nextActive;
      gameState.roundStatus = 'choosing';
      gameState.duelPicks = [];
      gameState.usedAttributes = [];
      gameState.selectedAttribute = null;
      gameState.roundWinner = null;
      gameState.roundResultText = '';
      gameState.turnResultText = '';
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
