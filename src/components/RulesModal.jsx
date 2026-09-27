import React from 'react';
import { X, Shield, Swords, Crown, Trophy, Sparkles, Award } from 'lucide-react';

export default function RulesModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="card-elevated w-full max-w-lg p-5 sm:p-7 rounded-3xl bg-white shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-400/20">
            <Trophy className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-stats tracking-wider uppercase">
              FC Match Regulations
            </h2>
            <p className="text-xs text-amber-700 font-bold">
              25 Duels • 1 Point Per Duel • Most Points Wins
            </p>
          </div>
        </div>

        {/* Rules Breakdown */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-slate-950 font-black font-stats">
              25
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">1. 25 Cards = 25 Duels</strong>
              Each player receives 25 cards in hand in a fixed sequence. The match consists of exactly 25 duels. You can scroll through your entire squad sequence in the tray at any time!
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Award className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">2. Each Duel Carries 1 Point</strong>
              The winner of each duel earns <strong>+1 point</strong> (indicated by glowing green corners). If a duel is tied, 0 points are awarded.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Crown className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">3. Winner Retains Call Advantage</strong>
              Whichever player wins the duel earns the right to choose the attribute for the next duel. If you lose, the corners glow red and the opponent gets the call.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Trophy className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">4. Victory Condition</strong>
              After all 25 duels conclude, points are tallied. The player with the <strong>most points wins the match</strong>!
            </div>
          </div>

        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider font-stats shadow-md shadow-amber-400/20 cursor-pointer"
        >
          Got It, Back To Match
        </button>
      </div>
    </div>
  );
}
