import React, { useEffect, useState } from 'react';
import CardView from './CardView';
import { ATTRIBUTES } from '../constants/attributes';
import { Swords, ArrowRight, Trophy, Zap, AlertCircle, Crown, Flame, Bot, Sparkles, Scale } from 'lucide-react';
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
  isOnlineGuest = false
}) {
  const [countdown, setCountdown] = useState(4);
  const isP1Turn = activePlayer === 1;
  const isP2Turn = activePlayer === 2;

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

  // Determine facedown status:
  const isP1Facedown = roundStatus === 'choosing' && isP2Turn && (gameMode === 'local' || isOnlineGuest);
  const isP2Facedown = roundStatus === 'choosing' && (
    (isP1Turn && gameMode !== 'spectator') ||
    gameMode === 'ai'
  );

  const isP1Interactive = roundStatus === 'choosing' && isP1Turn && !isOnlineGuest;
  const isP2Interactive = roundStatus === 'choosing' && isP2Turn && (gameMode === 'local' || (gameMode === 'online' && isOnlineGuest));

  const activeAttrObj = ATTRIBUTES.find(a => a.key === selectedAttribute);
  const AttrIcon = activeAttrObj?.Icon || Swords;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-2 px-2">
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 my-auto">
        
        {/* Player 1 Card */}
        <div className="flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs ${
              isP1Turn 
                ? 'bg-amber-400 text-slate-950 border border-amber-500' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}>
              {isP1Turn && <Crown className="w-3.5 h-3.5 fill-current" />}
              <span>{player1Name} {isP1Turn && '• CALLER'}</span>
            </span>
          </div>

          <CardView
            card={player1Card}
            isInteractive={isP1Interactive}
            isFacedown={isP1Facedown}
            onSelectAttribute={onSelectAttribute}
            selectedAttribute={selectedAttribute}
            isWinner={roundStatus === 'revealed' && roundWinner === 1}
            isLoser={roundStatus === 'revealed' && roundWinner === 2}
            playerName={player1Name}
            isCurrentTurn={isP1Turn}
          />
        </div>

        {/* Center Clash Controller (Light Theme) */}
        <div className="flex flex-col items-center justify-center my-2 lg:my-0 z-20 max-w-sm w-full text-center">
          {roundStatus === 'choosing' ? (
            <div className="glass-panel p-5 rounded-3xl w-full flex flex-col items-center border border-amber-300 bg-white/95 shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-500 flex items-center justify-center mb-3 shadow-md shadow-amber-400/30 animate-bounce">
                <Swords className="w-7 h-7 text-slate-950" />
              </div>

              <h2 className="text-xl font-black text-slate-900 font-stats tracking-wider uppercase mb-1">
                {isP1Turn ? `${player1Name}'s Turn` : `${player2Name}'s Turn`}
              </h2>

              <p className="text-xs text-slate-600 font-semibold mb-3 max-w-[240px]">
                {isP1Interactive || isP2Interactive
                  ? 'Select any attribute on your card to challenge the opponent!'
                  : gameMode === 'ai' && isP2Turn
                  ? 'AI bot is inspecting stats and selecting an attribute...'
                  : 'Waiting for opponent to choose an attribute...'}
              </p>

              <div className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="font-semibold">Attribute Duel In Progress</span>
              </div>
            </div>
          ) : (
            /* Revealed Comparison Clash Card */
            <div className="glass-panel p-5 sm:p-6 rounded-3xl w-full flex flex-col items-center border-2 border-amber-400 bg-white shadow-xl clash-shaking">
              {/* Stat Clash Indicator */}
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: activeAttrObj?.bgColor, color: activeAttrObj?.color }}
                >
                  <AttrIcon className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-slate-900 uppercase tracking-wider font-stats">
                  {activeAttrObj?.label} DUEL
                </span>
              </div>

              {/* Number Clash Visual */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 my-2">
                <div className={`px-4 py-2 rounded-2xl font-black font-stats text-2xl flex flex-col items-center ${
                  roundWinner === 1 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300' 
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">{player1Name}</span>
                  <span>{player1Card?.stats[selectedAttribute]}</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 flex items-center justify-center text-xs font-black text-slate-950 shadow-xs">
                  VS
                </div>

                <div className={`px-4 py-2 rounded-2xl font-black font-stats text-2xl flex flex-col items-center ${
                  roundWinner === 2 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300' 
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">{player2Name}</span>
                  <span>{player2Card?.stats[selectedAttribute]}</span>
                </div>
              </div>

              {/* Round Result Title */}
              <div className="my-2">
                <h3 className={`text-sm sm:text-base font-black tracking-wide ${
                  roundWinner === 1 ? 'text-emerald-700' : roundWinner === 2 ? 'text-amber-700' : 'text-sky-700'
                }`}>
                  {roundResultText}
                </h3>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                  {turnResultText}
                </p>
              </div>

              {/* Next Round Action Button */}
              <button
                onClick={() => {
                  sounds.playSelect();
                  onNextRound();
                }}
                className="mt-3 w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Next Card ({countdown}s)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Player 2 Card */}
        <div className="flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs ${
              isP2Turn 
                ? 'bg-amber-400 text-slate-950 border border-amber-500' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}>
              {isP2Turn && <Crown className="w-3.5 h-3.5 fill-current" />}
              <span>{player2Name} {isP2Turn && '• CALLER'}</span>
            </span>
          </div>

          <CardView
            card={player2Card}
            isInteractive={isP2Interactive}
            isFacedown={isP2Facedown}
            onSelectAttribute={onSelectAttribute}
            selectedAttribute={selectedAttribute}
            isWinner={roundStatus === 'revealed' && roundWinner === 2}
            isLoser={roundStatus === 'revealed' && roundWinner === 1}
            playerName={player2Name}
            isCurrentTurn={isP2Turn}
          />
        </div>

      </div>
    </div>
  );
}
