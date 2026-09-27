import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Sparkles, Swords, Play } from 'lucide-react';
import { sounds } from '../utils/sound';

export default function CoinTossModal({
  isOpen,
  player1Name = 'Player 1',
  player2Name = 'Player 2',
  tossWinner = 1, // 1 or 2
  onComplete
}) {
  const [isFlipping, setIsFlipping] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Heads = Player 1, Tails = Player 2
  const isHeads = tossWinner === 1;
  const winnerName = tossWinner === 1 ? player1Name : player2Name;

  useEffect(() => {
    if (!isOpen) return;

    setIsFlipping(true);
    setShowResult(false);
    setCountdown(3);

    // Play coin spin chime
    sounds.playCoinToss();

    // After 2 seconds of dramatic spinning, land the coin
    const spinTimer = setTimeout(() => {
      setIsFlipping(false);
      setShowResult(true);
      sounds.playWin();
    }, 2000);

    return () => clearTimeout(spinTimer);
  }, [isOpen, tossWinner]);

  // Auto-kickoff countdown after coin lands
  useEffect(() => {
    if (!showResult) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(tossWinner);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResult, tossWinner, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="card-elevated w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white shadow-2xl text-center relative overflow-hidden border-2 border-amber-400">
        
        {/* Ambient Gold Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-black uppercase tracking-wider mb-2 font-stats shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Match Kickoff Ritual</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-stats tracking-wider uppercase mb-1">
          Coin Toss For The Call
        </h2>
        <p className="text-xs text-slate-500 font-medium mb-6">
          {player1Name} (Heads) vs {player2Name} (Tails)
        </p>

        {/* 🪙 3D Spinning Gold Coin */}
        <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center perspective-[1000px]">
          <div
            className={`w-32 h-32 rounded-full border-4 border-amber-400 p-1 flex items-center justify-center shadow-xl transition-all ${
              isFlipping
                ? 'coin-spinning'
                : 'shadow-[0_0_35px_rgba(245,158,11,0.5)] transform scale-105'
            }`}
            style={{
              background: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #f59e0b 50%, #b45309 100%)'
            }}
          >
            {/* Coin Inset Rim */}
            <div className="w-full h-full rounded-full border-2 border-dashed border-amber-200/80 flex flex-col items-center justify-center text-slate-950 p-2 text-center select-none">
              {isHeads ? (
                <>
                  <Crown className="w-10 h-10 text-slate-950 fill-amber-300 drop-shadow-xs mb-1" />
                  <span className="text-xs font-black font-stats uppercase tracking-widest text-slate-950">
                    HEADS
                  </span>
                  <span className="text-[9px] font-bold text-slate-800">
                    {player1Name}
                  </span>
                </>
              ) : (
                <>
                  <Trophy className="w-10 h-10 text-slate-950 fill-amber-300 drop-shadow-xs mb-1" />
                  <span className="text-xs font-black font-stats uppercase tracking-widest text-slate-950">
                    TAILS
                  </span>
                  <span className="text-[9px] font-bold text-slate-800">
                    {player2Name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Toss Result Announcement */}
        {showResult ? (
          <div className="animate-scaleIn">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-sm font-black uppercase font-stats shadow-xs mb-2">
              <Crown className="w-4 h-4 text-emerald-700 fill-current" />
              <span>{isHeads ? 'HEADS WINS' : 'TAILS WINS'}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-stats tracking-wide uppercase mb-1">
              {winnerName} Won The Toss!
            </h3>
            <p className="text-xs text-amber-800 font-bold mb-6 max-w-xs mx-auto">
              {winnerName} earns the privilege to call the first attribute in Duel 1!
            </p>

            <button
              type="button"
              onClick={() => onComplete(tossWinner)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider font-stats flex items-center justify-center gap-2 shadow-lg shadow-amber-400/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Kick Off Match ({countdown}s)</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>Coin in the air... Calling heads or tails!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
