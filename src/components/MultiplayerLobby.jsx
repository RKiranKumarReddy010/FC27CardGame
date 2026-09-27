import React, { useState, useEffect } from 'react';
import { Bot, Users, Globe, Play, Sparkles, Shield, Copy, Check, ArrowRight, Loader2, AlertCircle, Trophy, Layers } from 'lucide-react';
import { sounds } from '../utils/sound';

export default function MultiplayerLobby({
  onStartGame,
  onJoinRoom,
  onCreateRoom,
  currentRoomCode,
  isHost,
  peerStatus,
  joinError,
  isConnecting,
  onClose
}) {
  const [mode, setMode] = useState('online'); // 'ai' | 'local' | 'online'
  const [deckSize, setDeckSize] = useState(10);
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [onlineTab, setOnlineTab] = useState('join'); // 'create' | 'join'
  const [recentRooms, setRecentRooms] = useState([]);

  // Check recent local rooms from localStorage
  useEffect(() => {
    try {
      const rooms = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fc_room_')) {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && item.roomCode && Date.now() - (item.createdAt || 0) < 3600000) {
            rooms.push(item);
          }
        }
      }
      setRecentRooms(rooms);
    } catch (e) {}
  }, [onlineTab]);

  const handleCopyCode = () => {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLaunchLocal = () => {
    sounds.playSelect();
    if (mode === 'ai') {
      onStartGame({
        mode: 'ai',
        deckSize,
        player1Name: player1Name.trim() || 'Player 1',
        player2Name: 'FC Tactical Bot'
      });
    } else if (mode === 'local') {
      onStartGame({
        mode: 'local',
        deckSize,
        player1Name: player1Name.trim() || 'Player 1',
        player2Name: player2Name.trim() || 'Player 2'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="card-elevated w-full max-w-xl p-5 sm:p-7 rounded-3xl relative overflow-hidden bg-white shadow-2xl max-h-[95vh] overflow-y-auto border border-slate-200">
        
        {/* Subtle Ambient Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold tracking-wider uppercase mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>EA Sports FC Card Battle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-stats tracking-wider uppercase">
            Multiplayer Match Lobby
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Host or join an online room to battle live with real-time sync
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-5 relative z-10">
          <button
            type="button"
            onClick={() => { sounds.playSelect(); setMode('online'); }}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
              mode === 'online'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/50 shadow-sm text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-5 h-5 text-emerald-600" />
            <div className="text-xs font-black uppercase font-stats">Online Room</div>
            <span className="text-[10px] text-slate-500 hidden sm:inline">Real-time P2P</span>
          </button>

          <button
            type="button"
            onClick={() => { sounds.playSelect(); setMode('local'); }}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
              mode === 'local'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/50 shadow-sm text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-5 h-5 text-amber-600" />
            <div className="text-xs font-black uppercase font-stats">Pass & Play</div>
            <span className="text-[10px] text-slate-500 hidden sm:inline">1 Device 2P</span>
          </button>

          <button
            type="button"
            onClick={() => { sounds.playSelect(); setMode('ai'); }}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
              mode === 'ai'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/50 shadow-sm text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-5 h-5 text-sky-600" />
            <div className="text-xs font-black uppercase font-stats">Vs FC Bot</div>
            <span className="text-[10px] text-slate-500 hidden sm:inline">Solo Practice</span>
          </button>
        </div>

        {/* Online Multiplayer Setup */}
        {mode === 'online' ? (
          <div className="space-y-4 mb-5 relative z-10">
            {/* Create vs Join Sub-tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setOnlineTab('join')}
                className={`flex-1 py-2 text-xs font-black uppercase font-stats rounded-lg transition-all cursor-pointer ${
                  onlineTab === 'join' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Join Existing Room
              </button>
              <button
                type="button"
                onClick={() => setOnlineTab('create')}
                className={`flex-1 py-2 text-xs font-black uppercase font-stats rounded-lg transition-all cursor-pointer ${
                  onlineTab === 'create' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Host New Room
              </button>
            </div>

            {/* Error Message Banner */}
            {joinError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{joinError}</span>
              </div>
            )}

            {/* JOIN ROOM TAB */}
            {onlineTab === 'join' ? (
              <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Your Player Name
                  </label>
                  <input
                    type="text"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    placeholder="e.g. Cristiano"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-400 focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Enter 4-Letter Room Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().trim())}
                    placeholder="e.g. FC77"
                    className="w-full px-3.5 py-3 rounded-xl bg-white border-2 border-slate-300 text-center font-stats text-2xl font-black text-slate-900 tracking-widest focus:border-amber-400 focus:outline-none shadow-xs placeholder-slate-400"
                  />
                </div>

                {/* Quick Join Recent Rooms if detected */}
                {recentRooms.length > 0 && (
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1 font-bold">Active Rooms Detected:</span>
                    <div className="flex flex-wrap gap-2">
                      {recentRooms.map((r) => (
                        <button
                          key={r.roomCode}
                          type="button"
                          onClick={() => {
                            setJoinCode(r.roomCode);
                            sounds.playHover();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-stats font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Room {r.roomCode}</span>
                          <span className="text-[10px] text-slate-500">({r.hostName})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  disabled={!joinCode.trim() || isConnecting}
                  onClick={() => {
                    sounds.playSelect();
                    onJoinRoom({
                      roomCode: joinCode.trim().toUpperCase(),
                      player2Name: player2Name.trim() || 'Player 2'
                    });
                  }}
                  className={`w-full py-3.5 rounded-xl font-black uppercase font-stats tracking-wider text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                    joinCode.trim() && !isConnecting
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer shadow-amber-400/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting To Room...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Arena & Join Match</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* CREATE ROOM TAB */
              <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Your Player Name (Host)
                  </label>
                  <input
                    type="text"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    placeholder="e.g. Kylian"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-400 focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Deck Size (Cards per player)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 25].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setDeckSize(size)}
                        className={`py-2 px-3 rounded-xl border text-xs font-black font-stats transition-all cursor-pointer ${
                          deckSize === size
                            ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {size} CARDS
                      </button>
                    ))}
                  </div>
                </div>

                {currentRoomCode ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center animate-pulse shadow-sm">
                    <span className="text-xs text-amber-800 font-bold block mb-1">
                      Give this Room Code to Player 2:
                    </span>
                    <div className="flex items-center justify-center gap-3 my-2">
                      <span className="text-3xl font-black font-stats text-slate-900 tracking-widest bg-white px-5 py-2 rounded-xl border border-amber-300 shadow-sm">
                        {currentRoomCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="p-2.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Copy Code"
                      >
                        {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="inline-flex items-center gap-2 mt-2 text-xs text-amber-800 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>{peerStatus || 'Waiting for Player 2 to join... Match starts automatically!'}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      sounds.playSelect();
                      onCreateRoom({
                        deckSize,
                        player1Name: player1Name.trim() || 'Player 1'
                      });
                    }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black uppercase font-stats tracking-wider text-base flex items-center justify-center gap-2 shadow-md shadow-amber-400/20 cursor-pointer"
                  >
                    <span>Create Room & Get Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* LOCAL & BOT SETUP */
          <div className="space-y-4 mb-5 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Player 1 Name
                </label>
                <input
                  type="text"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-400 focus:outline-none shadow-xs"
                />
              </div>

              {mode === 'local' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Player 2 Name
                  </label>
                  <input
                    type="text"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-amber-400 focus:outline-none shadow-xs"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Cards Per Player Deck
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 25].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => { sounds.playHover(); setDeckSize(size); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-black font-stats transition-all cursor-pointer ${
                      deckSize === size
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {size} CARDS
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleLaunchLocal}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-400/20 transform hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-4"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Kick Off Match</span>
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-3">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Rules: No shuffle • Winner keeps the call</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-bold transition-colors cursor-pointer"
            >
              Resume Game
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
