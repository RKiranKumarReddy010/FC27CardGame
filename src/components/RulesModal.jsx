import React from 'react';
import { X, Shield, Swords, Crown, Lock, Flame, Scale, Trophy, Sparkles } from 'lucide-react';

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
            <Shield className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-stats tracking-wider uppercase">
              FC Top Trumps Rules
            </h2>
            <p className="text-xs text-amber-700 font-bold">
              Official Card Duel Regulations
            </p>
          </div>
        </div>

        {/* Rules Breakdown */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">1. Strict No-Shuffle Decks</strong>
              Both players receive their dealt cards in a fixed sequence. Players cannot shuffle or reorder their decks. Each duel is fought with the top card drawn!
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Crown className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">2. Only One Chooser at a Time</strong>
              Only the active player ("Caller") can choose an attribute on their card. The other player must wait and keep their card face down until the attribute is called.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Swords className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">3. Higher Attribute Takes the Cards</strong>
              Once the attribute is chosen (OVR, PAC, SHO, PAS, DRI, DEF, PHY), both cards are revealed. The player with the higher attribute rating wins the round and claims both cards, placing them at the bottom of their deck.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Flame className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">4. Winner Gets Another Chance to Choose</strong>
              If you win the round, you retain the caller privilege and get another chance to pick the attribute on your next card! If your opponent beats you, the call transfers to them.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Scale className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">5. Ties Enter the War Pot</strong>
              If both cards have the exact same attribute rating, the cards are placed into the center War Pot. The same player calls from their next card. The winner of that duel wins all cards in the War Pot!
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Trophy className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <strong className="text-slate-900 text-sm block mb-0.5">6. Match Victory</strong>
              When one player captures all the cards (leaving their opponent with 0 cards in their deck), they are crowned the Ultimate FC Champion!
            </div>
          </div>

        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black uppercase font-stats text-sm tracking-wider cursor-pointer shadow-md shadow-amber-400/20"
        >
          Got It, Let's Play!
        </button>

      </div>
    </div>
  );
}
