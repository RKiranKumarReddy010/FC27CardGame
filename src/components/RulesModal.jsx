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
              Each player receives 25 cards in a fixed sequence. The match consists of 25 duels. You can preview upcoming cards anytime in the bottom scrollable squad sequence tray.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Swords className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">2. 3 Attributes Picked Per Duel (1 by 1)</strong>
              Each duel consists of 3 attribute clashes from the 6 core stats (<strong>PAC, SHO, PAS, DRI, DEF, PHY</strong>):
              <ul className="mt-1 list-disc list-inside text-slate-700 space-y-0.5 font-medium">
                <li><strong>Pick 1:</strong> Active Caller chooses 1st attribute.</li>
                <li><strong>Pick 2:</strong> Opponent chooses 2nd attribute from remaining unused stats.</li>
                <li><strong>Pick 3:</strong> Active Caller chooses 3rd attribute from remaining unused stats.</li>
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Award className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">3. 1 Point Per Duel (Majority of 3)</strong>
              The player who wins the majority of the 3 clashes (e.g. 2–1 or 3–0) wins the duel and earns <strong>+1 Match Point</strong> (with glowing green corner indicators).
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Crown className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">4. Winner Strictly Calls Next Duel</strong>
              Whichever player wins the duel gets the call for the next duel (becoming the First Picker). If you lose, the opponent gets the call.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Trophy className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">5. Victory Condition</strong>
              After all 25 duels conclude, the player with the <strong>most points wins the match</strong>!
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
