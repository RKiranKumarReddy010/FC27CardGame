import React from 'react';
import { Volume2, VolumeX, BookOpen, RotateCcw, Swords, Shield, Trophy, Users, Bot, Globe, Crown, Flame } from 'lucide-react';
import { sounds } from '../utils/sound';

export default function ScoreBoard({
  player1Name,
  player2Name,
  player1DeckCount,
  player2DeckCount,
  activePlayer,
  roundNumber,
  warPotCount,
  gameMode,
  isMuted,
  onToggleMute,
  onOpenRules,
  onOpenGallery,
  onResetGame,
  onChangeMode
}) {
  const isP1Turn = activePlayer === 1;

  return (
    <header className="w-full max-w-6xl mx-auto px-4 py-3 mb-2">
      {/* Top Navbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-500 flex items-center justify-center shadow-md shadow-amber-400/20">
            <Trophy className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-slate-900 font-stats flex items-center gap-1.5 leading-none">
              FC CLASH <span className="text-amber-800 text-xs px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300">TOP TRUMPS</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              EA Sports FC Official Ratings Duel
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Badge */}
          <button
            onClick={onChangeMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
            title="Change Game Mode"
          >
            {gameMode === 'ai' && <Bot className="w-3.5 h-3.5 text-sky-600" />}
            {gameMode === 'local' && <Users className="w-3.5 h-3.5 text-amber-600" />}
            {gameMode === 'online' && <Globe className="w-3.5 h-3.5 text-emerald-600" />}
            <span className="capitalize">{gameMode === 'ai' ? 'Vs Bot' : gameMode === 'local' ? 'Pass & Play' : 'Online Room'}</span>
          </button>

          {/* Cards Gallery */}
          <button
            onClick={onOpenGallery}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
            title="Explore 600 EA FC Cards"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Card Codex</span>
          </button>

          {/* Rules */}
          <button
            onClick={onOpenRules}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer shadow-xs"
            title="View Rules"
          >
            <Shield className="w-4 h-4 text-slate-600" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer shadow-xs"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
          </button>

          {/* Reset */}
          <button
            onClick={onResetGame}
            className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-600 transition-all cursor-pointer shadow-xs"
            title="Restart Match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scoreboard Arena HUD */}
      <div className="glass-panel p-3.5 grid grid-cols-3 items-center rounded-2xl border border-slate-200 relative overflow-hidden bg-white/90 shadow-sm">
        {/* Player 1 HUD */}
        <div className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
          isP1Turn ? 'bg-amber-50/80 border border-amber-300 shadow-xs' : 'bg-transparent'
        }`}>
          <div className="relative">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black font-stats text-lg ${
              isP1Turn 
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-400/20' 
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {player1DeckCount}
            </div>
            {isP1Turn && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 items-center justify-center shadow-xs">
                  <Crown className="w-2.5 h-2.5 text-slate-950 fill-current" />
                </span>
              </span>
            )}
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-slate-900 truncate">{player1Name}</span>
              {isP1Turn && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-stats shadow-xs">
                  <Crown className="w-2.5 h-2.5 fill-current" />
                  <span>CALLER</span>
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              {player1DeckCount} cards in deck
            </div>
          </div>
        </div>

        {/* Center Round / War Pot Status */}
        <div className="flex flex-col items-center justify-center text-center px-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Swords className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 font-stats">
              Round {roundNumber}
            </span>
          </div>

          {warPotCount > 0 ? (
            <div className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold animate-pulse flex items-center gap-1.5 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
              <span>WAR POT:</span>
              <span className="font-stats font-black text-rose-700 text-sm">+{warPotCount} CARDS</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 font-medium">
              {isP1Turn ? `${player1Name}'s Choice` : `${player2Name}'s Choice`}
            </span>
          )}
        </div>

        {/* Player 2 HUD */}
        <div className={`flex items-center justify-end gap-3 p-2 rounded-xl transition-all ${
          !isP1Turn ? 'bg-amber-50/80 border border-amber-300 shadow-xs' : 'bg-transparent'
        }`}>
          <div className="truncate text-right">
            <div className="flex items-center justify-end gap-1.5">
              {!isP1Turn && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-stats shadow-xs">
                  <Crown className="w-2.5 h-2.5 fill-current" />
                  <span>CALLER</span>
                </span>
              )}
              <span className="text-sm font-extrabold text-slate-900 truncate">{player2Name}</span>
            </div>
            <div className="text-xs text-slate-500">
              {player2DeckCount} cards in deck
            </div>
          </div>
          <div className="relative">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black font-stats text-lg ${
              !isP1Turn 
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-400/20' 
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {player2DeckCount}
            </div>
            {!isP1Turn && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 items-center justify-center shadow-xs">
                  <Crown className="w-2.5 h-2.5 text-slate-950 fill-current" />
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
