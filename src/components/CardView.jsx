import React, { useState, useEffect, useRef } from 'react';
import { ATTRIBUTES } from '../constants/attributes';
import { sounds } from '../utils/sound';
import { Shield, Sparkles, Award, Crown, CheckCircle2, XCircle, Swords, User } from 'lucide-react';

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
  const [imgErrorStage, setImgErrorStage] = useState(0); // 0: primary, 1: futbin, 2: avatar
  const cardRef = useRef(null);

  // Extract EA Player ID from URL or card id for fallback sources
  const eaId = React.useMemo(() => {
    if (!card) return null;
    if (card.imageUrl) {
      const m = card.imageUrl.match(/(\d+)(?:_en-GB)?\.webp/);
      if (m && m[1]) return m[1];
    }
    return card.id;
  }, [card]);

  // Reset image fallback when card changes
  useEffect(() => {
    setImgErrorStage(0);
  }, [card?.id, card?.imageUrl]);

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
      <div className="w-[300px] sm:w-[320px] h-[500px] rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center text-slate-400 glass-panel">
        <Shield className="w-12 h-12 mb-3 text-slate-300" />
        <span className="font-semibold text-sm">No Card In Hand</span>
      </div>
    );
  }

  // Facedown Card Back
  if (isFacedown) {
    return (
      <div 
        className="card-responsive relative w-[300px] sm:w-[320px] h-[500px] rounded-3xl p-1 bg-gradient-to-b from-amber-400/40 via-slate-200 to-slate-300 shadow-xl transition-all duration-300 border border-amber-300/40"
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
            <div className="relative w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-tr from-amber-200 via-amber-100 to-slate-100 p-1 border-2 border-amber-400/50 shadow-inner">
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center shadow-sm">
                <Award className="w-10 h-10 text-amber-500 mb-1" />
                <span className="text-xl font-black tracking-widest text-slate-800 font-stats">FC 25</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600">DUEL</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-5 text-center max-w-[190px] font-medium leading-relaxed">
              Card reveals when attribute is challenged
            </p>
          </div>

          {/* Bottom Wait Status */}
          <div className="w-full py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-sm">
            <div className="inline-flex items-center gap-2 text-xs text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Awaiting Call...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Faceup Card
  const { name, team, nationality, position, stats, imageUrl } = card;

  // Image source resolution
  const currentImageSrc = imgErrorStage === 0
    ? (imageUrl || `https://ratings-images-prod.pulse.ea.com/FC27/components/items/${eaId}_en-GB.webp`)
    : imgErrorStage === 1 && eaId
    ? `https://cdn.futbin.com/content/fifa25/img/players/${eaId}.png`
    : null;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out'
      }}
      className={`card-responsive relative w-[300px] sm:w-[320px] rounded-3xl p-[3px] shadow-xl transition-all duration-300 ${
        isWinner
          ? 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 ring-4 ring-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.45)]'
          : isLoser
          ? 'bg-gradient-to-b from-rose-500 via-rose-600 to-red-700 ring-4 ring-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.45)]'
          : isCurrentTurn && isInteractive
          ? 'bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 ring-2 ring-amber-400/50 shadow-md'
          : 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400'
      }`}
    >
      <div className="w-full h-full rounded-[23px] bg-white p-3.5 flex flex-col justify-between overflow-hidden relative border border-slate-200 bg-hex shadow-sm">
        {/* Hologram sheen shine */}
        <div className="sheen-effect absolute inset-0 pointer-events-none rounded-[23px]" />

        {/* 🟢 GREEN CORNER INDICATORS (When Winner) */}
        {isWinner && (
          <>
            <div className="absolute top-1.5 left-1.5 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl z-30 pointer-events-none animate-pulse" />
            <div className="absolute top-1.5 right-1.5 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl z-30 pointer-events-none animate-pulse" />
            <div className="absolute bottom-1.5 left-1.5 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl z-30 pointer-events-none animate-pulse" />
            <div className="absolute bottom-1.5 right-1.5 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-xl z-30 pointer-events-none animate-pulse" />
          </>
        )}

        {/* 🔴 RED CORNER INDICATORS (When Loser) */}
        {isLoser && (
          <>
            <div className="absolute top-1.5 left-1.5 w-6 h-6 border-t-4 border-l-4 border-rose-500 rounded-tl-xl z-30 pointer-events-none animate-pulse" />
            <div className="absolute top-1.5 right-1.5 w-6 h-6 border-t-4 border-r-4 border-rose-500 rounded-tr-xl z-30 pointer-events-none animate-pulse" />
            <div className="absolute bottom-1.5 left-1.5 w-6 h-6 border-b-4 border-l-4 border-rose-500 rounded-bl-xl z-30 pointer-events-none animate-pulse" />
            <div className="absolute bottom-1.5 right-1.5 w-6 h-6 border-b-4 border-r-4 border-rose-500 rounded-br-xl z-30 pointer-events-none animate-pulse" />
          </>
        )}

        {/* Top Header Badge (Position, Team, Nation, OVR) */}
        <div className="flex items-center justify-between mb-2 z-10 px-1">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-stats font-black text-xs shadow-xs">
              {position}
            </span>
            <span className="text-slate-800 text-xs font-bold truncate max-w-[125px]">
              {team}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-semibold truncate max-w-[80px]">
              {nationality}
            </span>
            <span className={`px-2 py-0.5 rounded-md font-stats font-black text-xs shadow-xs ${
              isWinner ? 'bg-emerald-600 text-white' : isLoser ? 'bg-rose-600 text-white' : 'bg-slate-900 text-amber-400'
            }`}>
              {stats.ovr}
            </span>
          </div>
        </div>

        {/* Player Image Artwork Box */}
        <div className={`card-image-box relative w-full h-[180px] rounded-2xl overflow-hidden border flex items-center justify-center mb-2 shadow-inner transition-all ${
          isWinner ? 'border-emerald-300 bg-emerald-50/30' : isLoser ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100'
        }`}>
          {currentImageSrc && imgErrorStage < 2 ? (
            <img
              key={currentImageSrc}
              src={currentImageSrc}
              alt={name}
              className={`w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] transform transition-transform duration-300 ${
                isWinner ? 'scale-105' : isLoser ? 'grayscale-[35%]' : 'hover:scale-105'
              }`}
              onError={() => {
                setImgErrorStage((prev) => prev + 1);
              }}
              loading="eager"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center my-auto">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md mb-2">
                <User className="w-8 h-8 text-slate-900" />
              </div>
              <div className="text-xl font-black text-slate-800 font-stats">{stats.ovr} OVR</div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">{position} • {team}</div>
            </div>
          )}

          {/* OVR Big Badge overlay */}
          <div className="absolute top-2 left-2 flex flex-col items-center bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-xl border border-amber-300 shadow-md z-10">
            <span className="text-[8px] text-amber-700 font-black tracking-wider uppercase">OVR</span>
            <span className="text-xl font-black font-stats text-slate-900 leading-none">{stats.ovr}</span>
          </div>

          {/* 🌟 WINNER / LOSER BADGE OVERLAY ON ARTWORK */}
          {isWinner && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-1 rounded-xl shadow-md z-20 animate-bounce">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-black font-stats tracking-wider uppercase">WIN (+1 PT)</span>
            </div>
          )}

          {isLoser && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-rose-600 text-white px-2.5 py-1 rounded-xl shadow-md z-20 animate-pulse">
              <XCircle className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-black font-stats tracking-wider uppercase">LOSS (0 PTS)</span>
            </div>
          )}

          {/* Player Name Banner (Single clean plate) */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-3 pb-1.5 px-2 text-center border-t border-slate-100 z-10">
            <h3 className="text-base font-black font-stats text-slate-900 tracking-wide uppercase truncate">
              {name}
            </h3>
          </div>
        </div>

        {/* Action Prompt when active turn */}
        {isInteractive && (
          <div className="mb-2 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-400 text-amber-800 text-[11px] font-black tracking-wider uppercase shadow-xs animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Choose Winning Attribute</span>
            </span>
          </div>
        )}

        {/* Attributes List */}
        <div className="flex flex-col gap-1.5 z-10">
          {ATTRIBUTES.map((attr) => {
            const val = stats[attr.key];
            const isSelected = selectedAttribute === attr.key;
            const Icon = attr.Icon;
            
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
                      ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-400 text-emerald-900 font-bold'
                      : isLoser
                      ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400 text-rose-900 font-bold'
                      : 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-md text-amber-900 font-bold'
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
                    backgroundColor: isSelected && isWinner ? '#10b981' : isSelected && isLoser ? '#f43f5e' : attr.color
                  }}
                />

                {/* Left: Icon & Label */}
                <div className="flex items-center gap-2 relative z-10">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={{ 
                      backgroundColor: isSelected && isWinner ? '#d1fae5' : isSelected && isLoser ? '#ffe4e6' : attr.bgColor,
                      color: isSelected && isWinner ? '#059669' : isSelected && isLoser ? '#e11d48' : attr.color 
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-xs font-bold tracking-wider ${
                    isSelected ? (isWinner ? 'text-emerald-950 font-black' : isLoser ? 'text-rose-950 font-black' : 'text-slate-900') : 'text-slate-700 group-hover:text-amber-800'
                  }`}>
                    {attr.short}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                    {attr.label}
                  </span>
                </div>

                {/* Right: Stat Number & Win/Loss icons */}
                <div className="flex items-center gap-1.5 relative z-10">
                  <span
                    className="text-lg font-black font-stats"
                    style={{
                      color: isSelected && isWinner ? '#059669' : isSelected && isLoser ? '#e11d48' : val >= 88 ? '#b45309' : val >= 80 ? '#0284c7' : '#334155'
                    }}
                  >
                    {val}
                  </span>
                  {isSelected && (
                    <span className="flex items-center">
                      {isWinner ? (
                        <Crown className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                      ) : isLoser ? (
                        <XCircle className="w-4 h-4 text-rose-600 fill-rose-100" />
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
