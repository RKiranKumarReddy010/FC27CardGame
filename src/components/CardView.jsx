import React, { useState, useEffect, useRef } from 'react';
import { ATTRIBUTES } from '../constants/attributes';
import { sounds } from '../utils/sound';
import { Shield, Sparkles, Award, Crown, XCircle, Swords, User, Check } from 'lucide-react';

const ROW_1_KEYS = ['pac', 'sho', 'pas'];
const ROW_2_KEYS = ['dri', 'def', 'phy'];

export default function CardView({
  card,
  isInteractive = false,
  isFacedown = false,
  onSelectAttribute,
  selectedAttribute = null,
  usedAttributes = [], // Attributes already chosen in this 3-pick duel
  duelPicks = [], // [{ attribute, winner, p1Val, p2Val }]
  isWinner = false,
  isLoser = false,
  playerName = 'Player',
  isCurrentTurn = false
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [imgErrorStage, setImgErrorStage] = useState(0);
  const cardRef = useRef(null);

  const eaId = React.useMemo(() => {
    if (!card) return null;
    if (card.imageUrl) {
      const m = card.imageUrl.match(/(\d+)(?:_en-GB)?\.webp/);
      if (m && m[1]) return m[1];
    }
    return card.id;
  }, [card]);

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
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  if (!card) {
    return (
      <div className="w-[300px] sm:w-[325px] max-w-[92vw] h-[440px] rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center text-slate-400 glass-panel mx-auto">
        <Shield className="w-10 h-10 mb-2 text-slate-300" />
        <span className="font-semibold text-xs">No Card In Hand</span>
      </div>
    );
  }

  // Facedown Card Back
  if (isFacedown) {
    return (
      <div 
        className="card-responsive relative w-[300px] sm:w-[325px] max-w-[92vw] h-[450px] sm:h-[465px] rounded-3xl p-1 bg-gradient-to-b from-amber-400/40 via-slate-200 to-slate-300 shadow-xl transition-all duration-300 border border-amber-300/40 mx-auto"
      >
        <div className="w-full h-full rounded-[22px] bg-white p-5 flex flex-col items-center justify-between relative overflow-hidden border border-slate-200 bg-hex">
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-500/60 rounded-tl" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-500/60 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-500/60 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-500/60 rounded-br" />

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-[11px] font-black tracking-wider uppercase font-stats">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{playerName}'s Card</span>
          </div>

          <div className="flex flex-col items-center justify-center my-auto">
            <div className="relative w-30 h-30 rounded-full flex items-center justify-center bg-gradient-to-tr from-amber-200 via-amber-100 to-slate-100 p-1 border-2 border-amber-400/50 shadow-inner">
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center shadow-sm">
                <Award className="w-10 h-10 text-amber-500 mb-0.5" />
                <span className="text-xl font-black tracking-widest text-slate-800 font-stats">FC 25</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600">DUEL</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-4 text-center max-w-[180px] font-medium leading-relaxed">
              Card reveals when challenged
            </p>
          </div>

          <div className="w-full py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-xs">
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

  const currentImageSrc = imgErrorStage === 0
    ? (imageUrl || `https://ratings-images-prod.pulse.ea.com/FC27/components/items/${eaId}_en-GB.webp`)
    : imgErrorStage === 1 && eaId
    ? `https://cdn.futbin.com/content/fifa25/img/players/${eaId}.png`
    : null;

  const renderAttributeTile = (key) => {
    const attr = ATTRIBUTES.find((a) => a.key === key);
    if (!attr) return null;
    const val = stats[key];
    const isSelected = selectedAttribute === key;
    const isUsed = usedAttributes.includes(key);
    const pastPick = duelPicks.find((p) => p.attribute === key);
    const Icon = attr.Icon;

    // Disabled if already used in this duel or not caller's turn
    const isTileClickable = isInteractive && !isUsed;

    return (
      <button
        key={key}
        type="button"
        disabled={!isTileClickable}
        onClick={() => {
          if (isTileClickable && onSelectAttribute) {
            sounds.playSelect();
            onSelectAttribute(key);
          }
        }}
        onMouseEnter={() => {
          if (isTileClickable) sounds.playHover();
        }}
        className={`relative py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl flex flex-col items-center justify-center border transition-all duration-150 select-none ${
          isSelected
            ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400 shadow-md text-amber-950 font-black'
            : isUsed
            ? pastPick && pastPick.winner === 1
              ? 'bg-emerald-50/90 border-emerald-400 text-emerald-900 opacity-90 cursor-not-allowed'
              : pastPick && pastPick.winner === 2
              ? 'bg-rose-50/90 border-rose-400 text-rose-900 opacity-90 cursor-not-allowed'
              : 'bg-slate-100 border-slate-300 text-slate-500 opacity-70 cursor-not-allowed'
            : isTileClickable
            ? 'bg-slate-50 hover:bg-amber-50 border-slate-200 hover:border-amber-400 active:scale-95 cursor-pointer shadow-2xs hover:shadow-sm'
            : 'bg-slate-50 border-slate-200 cursor-default opacity-85'
        }`}
      >
        {/* Past pick badge if already used */}
        {isUsed && pastPick && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900 text-white text-[8px] font-bold">
            ✓
          </span>
        )}

        <div className="flex items-center gap-1 mb-0.5">
          <div
            className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0"
            style={{
              backgroundColor: isUsed ? '#e2e8f0' : attr.bgColor,
              color: isUsed ? '#64748b' : attr.color
            }}
          >
            <Icon className="w-2.5 h-2.5" />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-wider font-stats ${
            isUsed ? 'text-slate-400 line-through' : 'text-slate-600'
          }`}>
            {attr.short}
          </span>
        </div>

        <span
          className={`text-base sm:text-lg font-black font-stats leading-none ${
            isUsed ? 'text-slate-400' : val >= 85 ? 'text-amber-700' : val >= 75 ? 'text-sky-700' : 'text-slate-800'
          }`}
        >
          {val}
        </span>
      </button>
    );
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out'
      }}
      className={`card-responsive relative w-[300px] sm:w-[325px] max-w-[92vw] mx-auto rounded-3xl p-[3px] shadow-xl transition-all duration-300 ${
        isWinner
          ? 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 ring-4 ring-emerald-400/90 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
          : isLoser
          ? 'bg-gradient-to-b from-rose-500 via-rose-600 to-red-700 ring-4 ring-rose-500/90 shadow-[0_0_35px_rgba(244,63,94,0.5)]'
          : isCurrentTurn && isInteractive
          ? 'bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 ring-2 ring-amber-400/50 shadow-md'
          : 'bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400'
      }`}
    >
      <div className="w-full h-full rounded-[23px] bg-white p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden relative border border-slate-200 bg-hex shadow-sm">
        {/* Hologram sheen shine */}
        <div className="sheen-effect absolute inset-0 pointer-events-none rounded-[23px]" />

        {/* 🟢 GREEN CORNER INDICATORS (4 Corners when Winner) */}
        {isWinner && (
          <>
            <div className="absolute top-1.5 left-1.5 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl z-30 pointer-events-none animate-pulse" />
            <div className="absolute top-1.5 right-1.5 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl z-30 pointer-events-none animate-pulse" />
            <div className="absolute bottom-1.5 left-1.5 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl z-30 pointer-events-none animate-pulse" />
            <div className="absolute bottom-1.5 right-1.5 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-xl z-30 pointer-events-none animate-pulse" />
          </>
        )}

        {/* 🔴 RED CORNER INDICATORS (4 Corners when Loser) */}
        {isLoser && (
          <>
            <div className="absolute top-1.5 left-1.5 w-6 h-6 border-t-4 border-l-4 border-rose-500 rounded-tl-xl z-30 pointer-events-none animate-pulse" />
            <div className="absolute top-1.5 right-1.5 w-6 h-6 border-t-4 border-r-4 border-rose-500 rounded-tr-xl z-30 pointer-events-none animate-pulse" />
            <div className="absolute bottom-1.5 left-1.5 w-6 h-6 border-b-4 border-l-4 border-rose-500 rounded-bl-xl z-30 pointer-events-none animate-pulse" />
            <div className="absolute bottom-1.5 right-1.5 w-6 h-6 border-b-4 border-r-4 border-rose-500 rounded-br-xl z-30 pointer-events-none animate-pulse" />
          </>
        )}

        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-1.5 z-10 px-0.5">
          <div className="flex items-center gap-1.5 truncate">
            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 font-stats font-black text-xs shadow-2xs border border-amber-400/30">
              {stats.ovr} OVR
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-stats font-black text-xs shadow-2xs">
              {position}
            </span>
            <span className="text-slate-800 text-xs font-extrabold truncate max-w-[110px]">
              {team}
            </span>
          </div>
          <span className="text-slate-500 text-[11px] font-semibold truncate max-w-[95px] text-right">
            {nationality}
          </span>
        </div>

        {/* Card Artwork Display */}
        <div className="card-image-box relative w-full h-[215px] sm:h-[230px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-50 via-amber-50/10 to-slate-100/60 border border-slate-200/80 flex items-center justify-center mb-2 shadow-inner">
          {currentImageSrc && imgErrorStage < 2 ? (
            <img
              key={currentImageSrc}
              src={currentImageSrc}
              alt={name}
              className={`w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] transition-transform duration-300 ${
                isWinner ? 'scale-105' : isLoser ? 'grayscale-[20%]' : ''
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
              <div className="text-2xl font-black text-slate-800 font-stats">{stats.ovr} OVR</div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">{name}</div>
            </div>
          )}

          {/* Victory / Defeat Floating Badge */}
          {isWinner && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-1 rounded-xl shadow-md z-20 animate-bounce">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-black font-stats tracking-wider uppercase">DUEL WON (+1 PT)</span>
            </div>
          )}

          {isLoser && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-rose-600 text-white px-2.5 py-1 rounded-xl shadow-md z-20 animate-pulse">
              <XCircle className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-black font-stats tracking-wider uppercase">DUEL LOST (0 PTS)</span>
            </div>
          )}
        </div>

        {/* Action Prompt when active turn */}
        {isInteractive && (
          <div className="mb-1.5 text-center">
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-100 border border-amber-400 text-amber-900 text-[10px] sm:text-[11px] font-black tracking-wider uppercase shadow-2xs animate-pulse font-stats">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Tap Available Attribute</span>
            </span>
          </div>
        )}

        {/* 📊 2-ROW ATTRIBUTES GRID: 6 Core Stats in 2 rows of 3 (Row 1: PAC, SHO, PAS | Row 2: DRI, DEF, PHY) */}
        <div className="w-full z-10">
          <div className="grid grid-cols-3 gap-1.5 mb-1.5">
            {ROW_1_KEYS.map((k) => renderAttributeTile(k))}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {ROW_2_KEYS.map((k) => renderAttributeTile(k))}
          </div>
        </div>
      </div>
    </div>
  );
}
