import React, { useState, useEffect, useCallback, useRef } from 'react';
import playersData from './data/players.json';
import ScoreBoard from './components/ScoreBoard';
import ArenaClash from './components/ArenaClash';
import MultiplayerLobby from './components/MultiplayerLobby';
import CardGalleryModal from './components/CardGalleryModal';
import RulesModal from './components/RulesModal';
import GameOverModal from './components/GameOverModal';
import CoinTossModal from './components/CoinTossModal';
import { multiplayer } from './utils/multiplayer';
import { sounds } from './utils/sound';
import { Trophy, ShieldCheck } from 'lucide-react';

export default function App() {
  // Game Setup State (Default 25 cards = 25 duels)
  const [gameMode, setGameMode] = useState('online'); // 'local' | 'ai' | 'online'
  const [deckSize, setDeckSize] = useState(25);
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');

  // Decks & Gameplay State
  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player2Deck, setPlayer2Deck] = useState([]);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [activePlayer, setActivePlayer] = useState(1); // 1 or 2
  const [roundStatus, setRoundStatus] = useState('choosing'); // 'choosing' | 'revealed'
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [roundWinner, setRoundWinner] = useState(null); // 1 | 2 | 'tie'
  const [roundResultText, setRoundResultText] = useState('');
  const [turnResultText, setTurnResultText] = useState('');
  
  // Modals & UI Feedback
  const [isLobbyOpen, setIsLobbyOpen] = useState(true);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isTossOpen, setIsTossOpen] = useState(false);
  const [tossWinner, setTossWinner] = useState(1);
  const [matchWinner, setMatchWinner] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  // Online Multiplayer State
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(true);
  const [peerStatus, setPeerStatus] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // AI thinking timeout reference
  const aiTimeoutRef = useRef(null);

  // Initial Deal (Deal 25 cards for 25 duels; 1 point per duel)
  const dealNewDecks = useCallback((size = 25, p1N, p2N, startPlayer = null) => {
    const shuffled = [...playersData].sort(() => 0.5 - Math.random());
    const p1Cards = shuffled.slice(0, size);
    const p2Cards = shuffled.slice(size, size * 2);

    const winner = startPlayer !== null ? startPlayer : (Math.random() < 0.5 ? 1 : 2);

    setPlayer1Deck(p1Cards);
    setPlayer2Deck(p2Cards);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setRoundNumber(1);
    setActivePlayer(winner);
    setTossWinner(winner);
    setRoundStatus('choosing');
    setSelectedAttribute(null);
    setRoundWinner(null);
    setRoundResultText('');
    setTurnResultText('');
    setIsGameOver(false);
    setIsLobbyOpen(false);
    setIsTossOpen(true); // 🪙 Kickoff Coin Toss!

    sounds.playCardFlip();
    return { p1Cards, p2Cards };
  }, []);

  // Configure Multiplayer event listeners
  useEffect(() => {
    multiplayer.setCallbacks({
      onGameStarted: (data) => {
        console.log('Match successfully started:', data);
        const { players, gameState, roomCode: rCode } = data;
        if (players && players.length >= 2) {
          setPlayer1Name(players[0].name || 'Player 1');
          setPlayer2Name(players[1].name || 'Player 2');
        }
        if (gameState) {
          setPlayer1Deck(gameState.player1Deck || []);
          setPlayer2Deck(gameState.player2Deck || []);
          setPlayer1Score(gameState.player1Score || 0);
          setPlayer2Score(gameState.player2Score || 0);
          setRoundNumber(gameState.roundNumber || 1);
          const winnerNum = gameState.tossWinner || gameState.activePlayer || 1;
          setActivePlayer(winnerNum);
          setTossWinner(winnerNum);
          setIsTossOpen(true); // 🪙 Launch synchronized kickoff toss!
          setRoundStatus(gameState.roundStatus || 'choosing');
          setSelectedAttribute(gameState.selectedAttribute || null);
          setRoundWinner(gameState.roundWinner || null);
          setRoundResultText(gameState.roundResultText || '');
          setTurnResultText(gameState.turnResultText || '');
        }
        if (rCode) setRoomCode(rCode);
        setIsConnecting(false);
        setJoinError('');
        setIsGameOver(false);
        setIsLobbyOpen(false);
        sounds.playCardFlip();
      },
      onRoundRevealed: ({ gameState }) => {
        if (!gameState) return;
        setSelectedAttribute(gameState.selectedAttribute);
        setRoundStatus(gameState.roundStatus);
        setRoundWinner(gameState.roundWinner);
        setRoundResultText(gameState.roundResultText);
        setTurnResultText(gameState.turnResultText);
        if (gameState.player1Score !== undefined) setPlayer1Score(gameState.player1Score);
        if (gameState.player2Score !== undefined) setPlayer2Score(gameState.player2Score);
        sounds.playClash();
        if (gameState.roundWinner === 'tie') {
          sounds.playTie();
        } else {
          sounds.playWin();
        }
      },
      onRoundAdvanced: ({ gameState }) => {
        if (!gameState) return;
        setPlayer1Deck(gameState.player1Deck);
        setPlayer2Deck(gameState.player2Deck);
        if (gameState.player1Score !== undefined) setPlayer1Score(gameState.player1Score);
        if (gameState.player2Score !== undefined) setPlayer2Score(gameState.player2Score);
        setRoundNumber(gameState.roundNumber);
        setActivePlayer(gameState.activePlayer);
        setRoundStatus('choosing');
        setSelectedAttribute(null);
        setRoundWinner(null);
        setRoundResultText('');
        setTurnResultText('');
        if (gameState.isGameOver) {
          setIsGameOver(true);
          setMatchWinner(gameState.matchWinner);
        }
        sounds.playCardFlip();
      },
      onPlayerLeft: ({ message }) => {
        setPeerStatus(message || 'Player disconnected');
      }
    });
  }, [dealNewDecks, deckSize, player1Name]);

  // Handle Local & Bot match launch
  const handleStartGame = ({ mode, deckSize: size, player1Name: p1, player2Name: p2 }) => {
    const finalSize = size || 25;
    setGameMode(mode);
    setDeckSize(finalSize);
    setPlayer1Name(p1);
    setPlayer2Name(p2);
    dealNewDecks(finalSize, p1, p2, null);
  };

  // Host creates an online room
  const handleCreateRoom = ({ deckSize: size, player1Name: p1 }) => {
    const finalSize = size || 25;
    setPlayer1Name(p1);
    setDeckSize(finalSize);
    setGameMode('online');
    setIsHost(true);
    setPeerStatus('Generating room...');
    setJoinError('');

    multiplayer.createRoom({ playerName: p1, deckSize: finalSize }, (res) => {
      if (res && res.success) {
        setRoomCode(res.roomCode);
        setPeerStatus('Waiting for Player 2 to enter room code...');
      } else {
        setJoinError('Could not generate room code. Try again.');
      }
    });
  };

  // Guest joins an online room
  const handleJoinRoom = ({ roomCode: code, player2Name: p2 }) => {
    setJoinError('');
    setIsConnecting(true);
    setGameMode('online');
    setIsHost(false);
    setPlayer2Name(p2);

    multiplayer.joinRoom({ roomCode: code, playerName: p2 }, (res) => {
      setIsConnecting(false);
      if (res && res.success) {
        setRoomCode(code);
        setPeerStatus('Joined room! Starting game...');
      } else {
        setJoinError(res?.error || `Room "${code}" not found. Please verify the code with Host.`);
      }
    });
  };

  // Local/AI Attribute selection logic: 1 Duel = 1 Point
  const executeSelectAttribute = useCallback((attrKey) => {
    if (roundStatus !== 'choosing') return;
    if (player1Deck.length === 0 || player2Deck.length === 0) return;

    const p1Card = player1Deck[0];
    const p2Card = player2Deck[0];

    const p1Val = p1Card.stats[attrKey];
    const p2Val = p2Card.stats[attrKey];

    setSelectedAttribute(attrKey);
    setRoundStatus('revealed');
    sounds.playClash();

    const attrName = attrKey.toUpperCase();

    if (p1Val > p2Val) {
      setRoundWinner(1);
      setPlayer1Score((s) => s + 1);
      setRoundResultText(`${p1Card.name} (${p1Val} ${attrName}) beats ${p2Card.name} (${p2Val} ${attrName})!`);
      setTurnResultText(`🎉 ${player1Name} wins Duel ${roundNumber} (+1 Pt) & retains the call!`);
      sounds.playWin();
    } else if (p2Val > p1Val) {
      setRoundWinner(2);
      setPlayer2Score((s) => s + 1);
      setRoundResultText(`${p2Card.name} (${p2Val} ${attrName}) beats ${p1Card.name} (${p1Val} ${attrName})!`);
      setTurnResultText(`🎉 ${player2Name} wins Duel ${roundNumber} (+1 Pt) & takes the call!`);
      sounds.playWin();
    } else {
      setRoundWinner('tie');
      setRoundResultText(`⚔️ Stalemate! Both cards tied with ${p1Val} ${attrName}!`);
      setTurnResultText(`Duel ${roundNumber} ended in a draw (0 pts). Call stays with ${activePlayer === 1 ? player1Name : player2Name}!`);
      sounds.playTie();
    }
  }, [roundStatus, player1Deck, player2Deck, roundNumber, activePlayer, player1Name, player2Name]);

  const handleSelectAttribute = (attrKey) => {
    if (gameMode === 'online') {
      multiplayer.chooseAttribute(attrKey);
    } else {
      executeSelectAttribute(attrKey);
    }
  };

  // AI Logic
  useEffect(() => {
    if (gameMode === 'ai' && activePlayer === 2 && roundStatus === 'choosing' && player2Deck.length > 0 && !isGameOver && !isTossOpen) {
      aiTimeoutRef.current = setTimeout(() => {
        const botCard = player2Deck[0];
        const keys = ['ovr', 'pac', 'sho', 'pas', 'dri', 'def', 'phy'];
        let bestKey = 'ovr';
        let highest = -1;

        keys.forEach((k) => {
          if (botCard.stats[k] > highest) {
            highest = botCard.stats[k];
            bestKey = k;
          }
        });

        executeSelectAttribute(bestKey);
      }, 1200);

      return () => {
        if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
      };
    }
  }, [gameMode, activePlayer, roundStatus, player2Deck, isGameOver, isTossOpen, executeSelectAttribute]);

  // Next Duel Progression: Discard card from hand; conclude after 25 duels
  const executeNextRound = useCallback(() => {
    if (roundStatus !== 'revealed') return;
    if (player1Deck.length === 0 || player2Deck.length === 0) return;

    const p1Remaining = player1Deck.slice(1);
    const p2Remaining = player2Deck.slice(1);

    setPlayer1Deck(p1Remaining);
    setPlayer2Deck(p2Remaining);

    // If all cards have been challenged, match is over!
    if (p1Remaining.length === 0 || p2Remaining.length === 0) {
      setIsGameOver(true);
      if (player1Score > player2Score) {
        setMatchWinner(player1Name);
      } else if (player2Score > player1Score) {
        setMatchWinner(player2Name);
      } else {
        setMatchWinner('Honorable Draw');
      }
      return;
    }

    const nextActivePlayer = roundWinner === 1 ? 1 : roundWinner === 2 ? 2 : activePlayer;

    setRoundNumber((r) => r + 1);
    setActivePlayer(nextActivePlayer);
    setRoundStatus('choosing');
    setSelectedAttribute(null);
    setRoundWinner(null);
    setRoundResultText('');
    setTurnResultText('');

    sounds.playCardFlip();
  }, [roundStatus, player1Deck, player2Deck, player1Score, player2Score, activePlayer, roundWinner, player1Name, player2Name]);

  const handleNextRound = () => {
    if (gameMode === 'online') {
      multiplayer.nextRound();
    } else {
      executeNextRound();
    }
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleResetMatch = () => {
    if (gameMode === 'online') {
      multiplayer.rematch();
    } else {
      dealNewDecks(deckSize, player1Name, player2Name, null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-400 selection:text-black bg-slate-50">
      {/* Top ScoreBoard HUD */}
      <ScoreBoard
        player1Name={player1Name}
        player2Name={player2Name}
        player1Score={player1Score}
        player2Score={player2Score}
        player1DeckCount={player1Deck.length}
        player2DeckCount={player2Deck.length}
        activePlayer={activePlayer}
        roundNumber={roundNumber}
        totalDuels={deckSize}
        gameMode={gameMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onResetGame={handleResetMatch}
        onChangeMode={() => setIsLobbyOpen(true)}
      />

      {/* Center Duel Arena */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {player1Deck.length > 0 && player2Deck.length > 0 ? (
          <ArenaClash
            player1Card={player1Deck[0]}
            player2Card={player2Deck[0]}
            player1Name={player1Name}
            player2Name={player2Name}
            activePlayer={activePlayer}
            selectedAttribute={selectedAttribute}
            roundStatus={roundStatus}
            roundWinner={roundWinner}
            roundResultText={roundResultText}
            turnResultText={turnResultText}
            onSelectAttribute={handleSelectAttribute}
            onNextRound={handleNextRound}
            gameMode={gameMode}
            isOnlineGuest={gameMode === 'online' && !isHost}
            player1Deck={player1Deck}
            player2Deck={player2Deck}
            roundNumber={roundNumber}
            totalDuels={deckSize}
          />
        ) : (
          <div className="text-center p-8 card-elevated rounded-3xl border border-slate-200 bg-white max-w-md mx-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-sm">
              <Trophy className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 font-stats uppercase mb-2">Ready For Kickoff</h3>
            <p className="text-xs text-slate-500 mb-6">
              Open the match lobby to host a game, join an online room, or challenge the FC Bot.
            </p>
            <button
              onClick={() => setIsLobbyOpen(true)}
              className="py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black uppercase font-stats text-sm shadow-md shadow-amber-400/20 cursor-pointer"
            >
              Open Match Lobby
            </button>
          </div>
        )}
      </main>

      {/* Footer Information */}
      <footer className="w-full text-center py-2 px-4 text-[11px] text-slate-500 border-t border-slate-200 flex flex-wrap items-center justify-center gap-4 bg-white/70">
        <span className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Official EA Sports FC Ratings Dataset ({playersData.length} Elite Cards)</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>25 Duels Match • Kickoff Coin Toss • 1 Duel = 1 Point</span>
        </span>
      </footer>

      {/* 🪙 Kickoff Coin Toss Modal */}
      <CoinTossModal
        isOpen={isTossOpen}
        player1Name={player1Name}
        player2Name={player2Name}
        tossWinner={tossWinner}
        onComplete={(winner) => {
          setActivePlayer(winner);
          setIsTossOpen(false);
        }}
      />

      {/* Lobby Modal */}
      {isLobbyOpen && (
        <MultiplayerLobby
          onStartGame={handleStartGame}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          currentRoomCode={roomCode}
          isHost={isHost}
          peerStatus={peerStatus}
          joinError={joinError}
          isConnecting={isConnecting}
          onClose={player1Deck.length > 0 ? () => setIsLobbyOpen(false) : null}
        />
      )}

      {/* Rules Modal */}
      {isRulesOpen && (
        <RulesModal onClose={() => setIsRulesOpen(false)} />
      )}

      {/* 600 Card Gallery Codex */}
      {isGalleryOpen && (
        <CardGalleryModal
          players={playersData}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}

      {/* Game Over Champion Celebration */}
      {isGameOver && (
        <GameOverModal
          winnerName={matchWinner}
          player1Name={player1Name}
          player2Name={player2Name}
          player1Score={player1Score}
          player2Score={player2Score}
          totalDuels={deckSize}
          onRematch={handleResetMatch}
          onChangeSettings={() => {
            setIsGameOver(false);
            setIsLobbyOpen(true);
          }}
        />
      )}
    </div>
  );
}
