import React, { useEffect, useState } from 'react';
import CardView from './CardView';
import { ATTRIBUTES } from '../constants/attributes';
import { Swords, ArrowRight, Trophy, Crown, Sparkles, ChevronRight, User } from 'lucide-react';
import { sounds } from '../utils/sound';

export default function ArenaClash({
  player1Card,
  player2Card,
  player1Name,
  player2Name,
  activePlayer,
  selectedAttribute,
  roundStatus, // 'choosing' | 'revealed'
  roundWinner, // 1 | 2 | 'tie' | null
  roundResultText,
  turnResultText,
  onSelectAttribute,
  onNextRound,
  gameMode,
  isOnlineGuest = false,
  player1Deck = [],
  player2Deck = [],
  roundNumber = 1,
  totalDuels = 25
}) {
  const [countdown, setCountdown] = useState(4);

  // Auto-advance countdown when revealed
  useEffect(() => {
    if (roundStatus !== 'revealed') {
      setCountdown(4);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNextRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [roundStatus, onNextRound]);

  // Player orientation: If user is Player 2 (guest), prioritize Player 2 as "YOU"
  const isUserP2 = isOnlineGuest;

  const myCard = isUserP2 ? player2Card : player1Card;
  const myName = isUserP2 ? player2Name : player1Name;
  const myDeck = isUserP2 ? player2Deck : player1Deck;
  const isMyTurn = isUserP2 ? activePlayer === 2 : activePlayer === 1;
  const myWinner = isUserP2 ? roundWinner === 2 : roundWinner === 1;
  const myLoser = isUserP2 ? roundWinner === 1 : roundWinner === 2;

  const opponentCard = isUserP2 ? player1Card : player2Card;
  const opponentName = isUserP2 ? player1Name : player2Name;
  const isOpponentTurn = !isMyTurn;
  const opponentWinner = isUserP2 ? roundWinner === 1 : roundWinner === 2;
  const opponentLoser = isUserP2 ? roundWinner === 2 : roundWinner === 1;

  // In Pass & Play (local 2P), both players take turns on same screen
  const isLocalMode = gameMode === 'local';

  // Face-down logic:
  // Your card is ALWAYS face-up so you can inspect your own player and choose!
  // Opponent card is face-down until revealed!
  const isOpponentFacedown = roundStatus === 'choosing';

  const activeAttrObj = ATTRIBUTES.find(a => a.key === selectedAttribute);
  const AttrIcon = activeAttrObj?.Icon || Swords;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-between py-1 px-2">
      {/* ⚔️ Dual Arena Combat Area */}
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 my-auto">
        
        {/* LEFT: YOUR CARD (Primary focus) */}
        <div className="flex flex-col items-center">
          <div className="mb-1.5 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs ${
              isMyTurn 
                ? 'bg-amber-400 text-slate-950 border border-amber-500 ring-2 ring-amber-400/40' 
                : 'bg-white text-slate-700 border border-slate-200'
            }`}>
              {isMyTurn && <Crown className="w-3.5 h-3.5 fill-current" />}
              <span>{myName} (YOU) {isMyTurn && '• CALLING'}</span>
            </span>
          </div>

          <CardView
            key={`my-${myCard?.id || 'empty'}`}
            card={myCard}
            isInteractive={roundStatus === 'choosing' && isMyTurn}
            isFacedown={false}
            onSelectAttribute={onSelectAttribute}
            selectedAttribute={selectedAttribute}
            isWinner={roundStatus === 'revealed' && myWinner}
            isLoser={roundStatus === 'revealed' && myLoser}
            playerName={myName}
            isCurrentTurn={isMyTurn}
          />
        </div>

        {/* CENTER: Clash Controller */}
        <div className="flex flex-col items-center justify-center my-2 lg:my-0 z-20 max-w-sm w-full text-center">
          {roundStatus === 'choosing' ? (
            <div className="glass-panel p-5 rounded-3xl w-full flex flex-col items-center border border-amber-300 bg-white/95 shadow-md">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-500 flex items-center justify-center mb-3 shadow-md shadow-amber-400/30 animate-bounce">
                <Swords className="w-6 h-6 text-slate-950" />
              </div>

              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 mb-1">
                Duel {roundNumber} of {totalDuels}
              </span>

              <h2 className="text-xl font-black text-slate-900 font-stats tracking-wider uppercase mb-1">
                {isMyTurn ? 'Your Call' : `${opponentName}'s Call`}
              </h2>

              <p className="text-xs text-slate-600 font-semibold mb-3 max-w-[240px]">
                {isMyTurn
                  ? 'Click any attribute on your card to challenge opponent!'
                  : gameMode === 'ai'
                  ? 'AI Bot is selecting its strongest attribute...'
                  : `Waiting for ${opponentName} to make a call...`}
              </p>

              <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="font-semibold">{isMyTurn ? 'Your Turn to Pick' : 'Opponent Choosing'}</span>
              </div>
            </div>
          ) : (
            /* Revealed Comparison Clash Card */
            <div className="glass-panel p-5 rounded-3xl w-full flex flex-col items-center border-2 border-amber-400 bg-white shadow-xl clash-shaking">
              {/* Stat Clash Indicator */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: activeAttrObj?.bgColor, color: activeAttrObj?.color }}
                >
                  <AttrIcon className="w-4 h-4" />
                </div>
                <span className="text-base font-black text-slate-900 uppercase tracking-wider font-stats">
                  {activeAttrObj?.label} CLASH
                </span>
              </div>

              {/* Number Clash Visual */}
              <div className="flex items-center justify-center gap-3 my-2">
                <div className={`px-4 py-2 rounded-2xl font-black font-stats text-2xl flex flex-col items-center ${
                  myWinner 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300' 
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">{myName}</span>
                  <span>{myCard?.stats[selectedAttribute]}</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 flex items-center justify-center text-xs font-black text-slate-950 shadow-xs">
                  VS
                </div>

                <div className={`px-4 py-2 rounded-2xl font-black font-stats text-2xl flex flex-col items-center ${
                  opponentWinner 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300' 
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">{opponentName}</span>
                  <span>{opponentCard?.stats[selectedAttribute]}</span>
                </div>
              </div>

              {/* Round Result Title */}
              <div className="my-1.5">
                <h3 className={`text-sm font-black tracking-wide ${
                  myWinner ? 'text-emerald-700' : opponentWinner ? 'text-amber-700' : 'text-sky-700'
                }`}>
                  {myWinner ? `🎉 You Win Duel ${roundNumber} (+1 Point)` : opponentWinner ? `⚡ ${opponentName} Wins Duel ${roundNumber} (+1 Point)` : `⚔️ Stalemate Duel (0 Points)`}
                </h3>
              </div>

              {/* Next Round Action Button */}
              <button
                type="button"
                onClick={() => {
                  sounds.playSelect();
                  onNextRound();
                }}
                className="mt-2.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-400/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Next Duel ({countdown}s)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: OPPONENT CARD */}
        <div className="flex flex-col items-center">
          <div className="mb-1.5 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs ${
              isOpponentTurn 
                ? 'bg-amber-400 text-slate-950 border border-amber-500' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}>
              {isOpponentTurn && <Crown className="w-3.5 h-3.5 fill-current" />}
              <span>{opponentName} {isOpponentTurn && '• CALLING'}</span>
            </span>
          </div>

          <CardView
            key={`opp-${opponentCard?.id || 'empty'}`}
            card={opponentCard}
            isInteractive={false}
            isFacedown={isOpponentFacedown}
            onSelectAttribute={null}
            selectedAttribute={selectedAttribute}
            isWinner={roundStatus === 'revealed' && opponentWinner}
            isLoser={roundStatus === 'revealed' && opponentLoser}
            playerName={opponentName}
            isCurrentTurn={isOpponentTurn}
          />
        </div>

      </div>

      {/* 📜 SCROLLABLE SQUAD SEQUENCE TRAY (All 25 Cards in sequence) */}
      <div className="w-full mt-4 p-3 rounded-2xl bg-white/90 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 uppercase font-stats tracking-wider">
              Your Squad Sequence
            </span>
            <span className="text-[11px] text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
              {myDeck.length} Cards Remaining (Scroll ➔)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Cards are challenged in this exact order
          </span>
        </div>

        {/* Horizontal scroll container */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scroll-smooth">
          {myDeck.map((c, index) => {
            const isCurrentActive = index === 0;
            const duelNum = roundNumber + index;
            const eaId = c.imageUrl ? (c.imageUrl.match(/(\d+)(?:_en-GB)?\.webp/) || [])[1] : c.id;
            const imgUrl = c.imageUrl || `https://ratings-images-prod.pulse.ea.com/FC27/components/items/${eaId}_en-GB.webp`;

            return (
              <div
                key={`deck-seq-${c.id}-${index}`}
                className={`shrink-0 w-28 sm:w-32 rounded-xl p-2 transition-all border relative flex flex-col items-center ${
                  isCurrentActive
                    ? 'bg-amber-50 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-md transform -translate-y-1'
                    : 'bg-slate-50 hover:bg-white border-slate-200 opacity-90'
                }`}
              >
                {/* Duel number badge */}
                <div className="w-full flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded font-stats ${
                    isCurrentActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isCurrentActive ? 'ACTIVE' : `Duel ${duelNum}`}
                  </span>
                  <span className="text-[10px] font-black font-stats text-slate-900">
                    {c.stats.ovr}
                  </span>
                </div>

                {/* Player thumbnail */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center my-1 relative shadow-2xs">
                  <img
                    src={imgUrl}
                    alt={c.name}
                    className="w-full h-full object-contain filter drop-shadow-xs"
                    onError={(e) => {
                      // Fallback to futbin cutout
                      if (eaId) {
                        e.target.src = `https://cdn.futbin.com/content/fifa25/img/players/${eaId}.png`;
                      }
                    }}
                  />
                </div>

                {/* Name & Position */}
                <div className="w-full text-center truncate">
                  <div className="text-[11px] font-extrabold text-slate-900 truncate">
                    {c.name}
                  </div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase">
                    {c.position} • {c.team}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
