import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Award, Sparkles, Swords, Crown } from 'lucide-react';
import { sounds } from '../utils/sound';

export default function GameOverModal({
  winnerName,
  player1Name = 'Player 1',
  player2Name = 'Player 2',
  player1Score = 0,
  player2Score = 0,
  totalDuels = 25,
  onRematch,
  onChangeSettings
}) {
  const isDraw = player1Score === player2Score;

  useEffect(() => {
    sounds.playFanfare();
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
        <div className="relative mx-auto w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-500 flex items-center justify-center mb-4 shadow-xl shadow-amber-400/30 p-1">
          <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center">
            <Trophy className="w-11 h-11 sm:w-12 sm:h-12 text-slate-950 animate-bounce" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black uppercase tracking-wider mb-2 font-stats shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>All {totalDuels} Duels Completed</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-stats tracking-wider uppercase mb-1">
          {isDraw ? 'Honorable Stalemate!' : `${winnerName} Wins!`}
        </h2>
        <p className="text-sm font-extrabold text-amber-700 uppercase tracking-widest font-stats mb-5">
          {isDraw ? 'Equal Points Earned in 25 Duels' : 'Champion By Points Victory'}
        </p>

        {/* Final Points Scoreboard */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">
            Final Match Points Breakdown
          </div>
          <div className="grid grid-cols-2 gap-3 items-center">
            {/* P1 */}
            <div className={`p-3 rounded-xl border flex flex-col items-center ${
              player1Score > player2Score
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/50 shadow-xs'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                {player1Score > player2Score && <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />}
                <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{player1Name}</span>
              </div>
              <span className="text-3xl font-black font-stats text-slate-900">{player1Score}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Points Won</span>
            </div>

            {/* P2 */}
            <div className={`p-3 rounded-xl border flex flex-col items-center ${
              player2Score > player1Score
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/50 shadow-xs'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                {player2Score > player1Score && <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />}
                <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{player2Name}</span>
              </div>
              <span className="text-3xl font-black font-stats text-slate-900">{player2Score}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Points Won</span>
            </div>
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
            <span>Rematch (Fresh 25 Duels)</span>
          </button>

          <button
            onClick={() => {
              sounds.playSelect();
              onChangeSettings();
            }}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-slate-200"
          >
            Change Mode / Settings
          </button>
        </div>
      </div>
    </div>
  );
}
