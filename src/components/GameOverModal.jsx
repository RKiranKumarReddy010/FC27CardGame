import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Award, Sparkles, Layers } from 'lucide-react';
import { sounds } from '../utils/sound';

export default function GameOverModal({
  winnerName,
  totalRounds,
  totalCardsWon,
  onRematch,
  onChangeSettings
}) {
  useEffect(() => {
    sounds.playFanfare();
    // Confetti cannon
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#f59e0b', '#10b981', '#0284c7', '#7c3aed', '#e11d48'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="card-elevated w-full max-w-md p-6 sm:p-8 rounded-3xl border-2 border-amber-400 bg-white shadow-2xl text-center relative overflow-hidden">
        
        {/* Subtle Sheen */}
        <div className="sheen-effect absolute inset-0 pointer-events-none" />

        {/* Champion Trophy Icon */}
        <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-500 flex items-center justify-center mb-4 shadow-xl shadow-amber-400/30 p-1">
          <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-slate-950 animate-bounce" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black uppercase tracking-wider mb-2 font-stats shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Match Concluded</span>
        </div>

        <h2 className="text-3xl font-black text-slate-900 font-stats tracking-wider uppercase mb-1">
          {winnerName}
        </h2>
        <p className="text-base font-extrabold text-amber-700 uppercase tracking-widest font-stats mb-6">
          Is The Ultimate FC Champion!
        </p>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Total Rounds</span>
            <span className="text-2xl font-black text-slate-900 font-stats">{totalRounds}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Cards Conquered</span>
            <span className="text-2xl font-black text-amber-600 font-stats">{totalCardsWon}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sounds.playSelect();
              onRematch();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider font-stats flex items-center justify-center gap-2 shadow-lg shadow-amber-400/30 transform hover:scale-[1.02] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rematch With Fresh Deal</span>
          </button>

          <button
            onClick={() => {
              sounds.playSelect();
              onChangeSettings();
            }}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-slate-200"
          >
            Change Mode / Deck Settings
          </button>
        </div>

      </div>
    </div>
  );
}
