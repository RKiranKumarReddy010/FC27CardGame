import React, { useState, useRef } from 'react';
import { ATTRIBUTES } from '../constants/attributes';
import { sounds } from '../utils/sound';
import { Shield, Sparkles, Award, Crown, CheckCircle2, XCircle, Swords } from 'lucide-react';

export default function CardView({
  card,
  isInteractive = false,
  isFacedown = false,
  onSelectAttribute,
  selectedAttribute = null,
  isWinner = false,
  isLoser = false,
  playerName = 'Player',
  isCurrentTurn = false
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current || isFacedown) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  if (!card) {
    return (
      <div className="w-[300px] h-[480px] rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center text-slate-400 glass-panel">
        <Shield className="w-12 h-12 mb-3 text-slate-300" />
        <span className="font-semibold text-sm">No Card In Deck</span>
      </div>
    );
  }

  // Facedown Card Back (Light Theme)
  if (isFacedown) {
    return (
      <div 
        className="card-responsive relative w-[310px] sm:w-[330px] h-[510px] rounded-3xl p-1 bg-gradient-to-b from-amber-400/40 via-slate-200 to-slate-300 shadow-xl transition-all duration-300 border border-amber-300/40"
      >
        <div className="w-full h-full rounded-[22px] bg-white p-6 flex flex-col items-center justify-between relative overflow-hidden border border-slate-200 bg-hex">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-500/60 rounded-tl" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-500/60 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-500/60 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-500/60 rounded-br" />

          {/* Top Label */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{playerName}'s Card</span>
          </div>

          {/* Center Shield Emblem */}
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center bg-gradient-to-tr from-amber-200 via-amber-100 to-slate-100 p-1 border-2 border-amber-400/50 shadow-inner">
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center shadow-sm">
                <Award className="w-10 h-10 text-amber-500 mb-1" />
                <span className="text-xl font-black tracking-widest text-slate-800 font-stats">FC 25</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600">CLASH</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-6 text-center max-w-[200px] font-medium leading-relaxed">
              Card hidden until attribute is challenged
            </p>
          </div>

          {/* Bottom Wait Status */}
          <div className="w-full py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-sm">
            <div className="inline-flex items-center gap-2 text-xs text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Awaiting Attribute Call...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Faceup Active Card (Light Theme)
  const { name, team, nationality, position, stats, imageUrl } = card;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out'
      }}
      className={`card-responsive relative w-[310px] sm:w-[330px] rounded-3xl p-[3px] shadow-xl transition-all duration-300 ${
        isWinner
          ? 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 winner-pulse'
          : isLoser
          ? 'bg-gradient-to-b from-rose-300 via-slate-200 to-slate-300 opacity-80'
          : isCurrentTurn && isInteractive
          ? 'bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 active-turn-pulse'
          : 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400'
      }`}
    >
      <div className="w-full h-full rounded-[23px] bg-white p-4 flex flex-col justify-between overflow-hidden relative border border-slate-200 bg-hex shadow-sm">
        {/* Hologram sheen shine */}
        <div className="sheen-effect absolute inset-0 pointer-events-none rounded-[23px]" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 font-stats font-bold text-xs shadow-xs">
              {position}
            </span>
            <span className="text-slate-700 text-xs font-bold truncate max-w-[140px]">
              {team}
            </span>
          </div>
          <span className="text-slate-500 text-xs font-medium truncate max-w-[90px]">
            {nationality}
          </span>
        </div>

        {/* Player Image Artwork & EA FC Style Card Banner */}
        <div className="card-image-box relative w-full h-[180px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center mb-3 shadow-inner">
          {!imgError ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] transform hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Award className="w-12 h-12 text-amber-500 mb-2" />
              <div className="text-2xl font-black text-slate-800 font-stats">{stats.ovr}</div>
              <div className="text-sm font-bold text-slate-700">{name}</div>
            </div>
          )}

          {/* OVR Big Badge overlay */}
          <div className="absolute top-2 left-2 flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-300 shadow-md">
            <span className="text-[10px] text-amber-700 font-bold tracking-wider uppercase">OVR</span>
            <span className="text-2xl font-black font-stats text-slate-900 leading-none">{stats.ovr}</span>
          </div>

          {/* Player Name Banner bottom */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white/90 to-transparent p-2 text-center border-t border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 tracking-wide truncate">
              {name}
            </h3>
          </div>
        </div>

        {/* Action Prompt when active turn */}
        {isInteractive && (
          <div className="mb-2 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-400 text-amber-800 text-[11px] font-black tracking-wider uppercase shadow-xs animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Select Winning Attribute</span>
            </span>
          </div>
        )}

        {/* Attributes List */}
        <div className="flex flex-col gap-1.5 z-10">
          {ATTRIBUTES.map((attr) => {
            const val = stats[attr.key];
            const isSelected = selectedAttribute === attr.key;
            const Icon = attr.Icon;
            
            // Value percentage for progress bar (scale 40 to 99)
            const percent = Math.min(100, Math.max(10, ((val - 40) / 59) * 100));

            return (
              <button
                key={attr.key}
                type="button"
                disabled={!isInteractive}
                onClick={() => {
                  if (isInteractive && onSelectAttribute) {
                    sounds.playSelect();
                    onSelectAttribute(attr.key);
                  }
                }}
                onMouseEnter={() => {
                  if (isInteractive) sounds.playHover();
                }}
                className={`w-full group text-left px-3 py-1.5 rounded-xl transition-all duration-200 flex items-center justify-between border relative overflow-hidden ${
                  isSelected
                    ? isWinner
                      ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-400 text-emerald-900'
                      : isLoser
                      ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/50 text-rose-900'
                      : 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-md text-amber-900'
                    : isInteractive
                    ? 'bg-slate-50 hover:bg-amber-50 border-slate-200 hover:border-amber-400 cursor-pointer transform hover:translate-x-1 shadow-xs'
                    : 'bg-slate-50 border-slate-200 cursor-default opacity-85'
                }`}
              >
                {/* Background stat progress fill bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 opacity-10 pointer-events-none transition-all duration-500 rounded-xl"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: attr.color
                  }}
                />

                {/* Left: Icon & Label */}
                <div className="flex items-center gap-2 relative z-10">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: attr.bgColor, color: attr.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-xs font-bold tracking-wider ${
                    isSelected ? 'text-slate-900' : 'text-slate-700 group-hover:text-amber-800'
                  }`}>
                    {attr.short}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                    {attr.label}
                  </span>
                </div>

                {/* Right: Stat Number */}
                <div className="flex items-center gap-1.5 relative z-10">
                  <span
                    className="text-lg font-black font-stats"
                    style={{
                      color: val >= 88 ? '#b45309' : val >= 80 ? '#0284c7' : '#334155'
                    }}
                  >
                    {val}
                  </span>
                  {isSelected && (
                    <span className="flex items-center">
                      {isWinner ? (
                        <Crown className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                      ) : isLoser ? (
                        <XCircle className="w-4 h-4 text-rose-500 fill-rose-100" />
                      ) : (
                        <Swords className="w-4 h-4 text-amber-600" />
                      )}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
