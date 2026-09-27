import React, { useEffect, useState } from 'react';
import CardView from './CardView';
import { ATTRIBUTES } from '../constants/attributes';
import { Swords, ArrowRight, Trophy, Crown, Sparkles, ChevronRight, User } from 'lucide-react';
import { sounds } from '../utils/sound';

export default function ArenaClash({
  player1Card,
  player2Card,
  player1Name,
  player2Name,
  activePlayer,
  currentPicker = 1,
  duelPicks = [],
  usedAttributes = [],
  selectedAttribute,
  roundStatus, // 'choosing' | 'revealed'
  roundWinner, // 1 | 2 | 'tie' | null
  roundResultText,
  turnResultText,
  onSelectAttribute,
  onNextRound,
  gameMode,
  isOnlineGuest = false,
  player1Deck = [],
  player2Deck = [],
  roundNumber = 1,
  totalDuels = 25
}) {
  const [countdown, setCountdown] = useState(4);

  // Auto-advance countdown when revealed
  useEffect(() => {
    if (roundStatus !== 'revealed') {
      setCountdown(4);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNextRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [roundStatus, onNextRound]);

  // Player orientation: If user is Player 2 (guest), prioritize Player 2 as "YOU"
  const isUserP2 = isOnlineGuest;

  const myCard = isUserP2 ? player2Card : player1Card;
  const myName = isUserP2 ? player2Name : player1Name;
  const myDeck = isUserP2 ? player2Deck : player1Deck;
  const isMyCall = isUserP2 ? activePlayer === 2 : activePlayer === 1;
  const isMyPick = isUserP2 ? currentPicker === 2 : currentPicker === 1;
  const myWinner = isUserP2 ? roundWinner === 2 : roundWinner === 1;
  const myLoser = isUserP2 ? roundWinner === 1 : roundWinner === 2;

  const opponentCard = isUserP2 ? player1Card : player2Card;
  const opponentName = isUserP2 ? player1Name : player2Name;
  const isOpponentCall = !isMyCall;
  const isOpponentPick = !isMyPick;
  const opponentWinner = isUserP2 ? roundWinner === 1 : roundWinner === 2;
  const opponentLoser = isUserP2 ? roundWinner === 2 : roundWinner === 1;

  const isOpponentFacedown = gameMode !== 'local' && roundStatus === 'choosing';

  // Calculate clash points within the current duel (out of 3)
  const myPickWins = duelPicks.filter(p => isUserP2 ? p.winner === 2 : p.winner === 1).length;
  const oppPickWins = duelPicks.filter(p => isUserP2 ? p.winner === 1 : p.winner === 2).length;

  const currentPickNumber = Math.min(duelPicks.length + 1, 3);

  // Slot helper for 3 picks
  const renderPickSlot = (slotIndex) => {
    const pick = duelPicks[slotIndex];
    const isSlotCurrent = roundStatus === 'choosing' && duelPicks.length === slotIndex;
    const isSlotPending = duelPicks.length < slotIndex;
    const pickNum = slotIndex + 1;

    // Whose pick is this slot?
    // Slot 0 (Pick 1): Caller
    // Slot 1 (Pick 2): Opponent
    // Slot 2 (Pick 3): Caller
    const slotPickerNum = slotIndex === 1
      ? (activePlayer === 1 ? 2 : 1)
      : activePlayer;
    const isSlotMine = isUserP2 ? slotPickerNum === 2 : slotPickerNum === 1;
    const pickerLabel = isSlotMine ? 'YOU' : opponentName;

    if (pick) {
      const attrObj = ATTRIBUTES.find(a => a.key === pick.attribute);
      const AttrIcon = attrObj?.Icon || Swords;
      const myVal = isUserP2 ? pick.p2Val : pick.p1Val;
      const oppVal = isUserP2 ? pick.p1Val : pick.p2Val;
      const didIWin = isUserP2 ? pick.winner === 2 : pick.winner === 1;
      const didOppWin = isUserP2 ? pick.winner === 1 : pick.winner === 2;
      const isTie = pick.winner === 'tie';

      return (
        <div
          key={`slot-${slotIndex}`}
          className={`flex-1 p-2 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
            didIWin
              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-2xs'
              : didOppWin
              ? 'bg-rose-50 border-rose-300 text-rose-950 opacity-90'
              : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-stats">
              #{pickNum}
            </span>
            <div
              className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0"
              style={{ backgroundColor: attrObj?.bgColor, color: attrObj?.color }}
            >
              <AttrIcon className="w-2.5 h-2.5" />
            </div>
            <span className="text-[10px] font-black uppercase font-stats">
              {attrObj?.short || pick.attribute.toUpperCase()}
            </span>
          </div>

          <div className="text-[11px] font-black font-stats my-0.5">
            <span className={didIWin ? 'text-emerald-700 font-extrabold' : 'text-slate-700'}>{myVal}</span>
            <span className="text-slate-400 mx-1">v</span>
            <span className={didOppWin ? 'text-rose-700 font-extrabold' : 'text-slate-700'}>{oppVal}</span>
          </div>

          <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full font-stats tracking-wider ${
            didIWin
              ? 'bg-emerald-600 text-white'
              : didOppWin
              ? 'bg-rose-600 text-white'
              : 'bg-slate-300 text-slate-800'
          }`}>
            {didIWin ? 'YOU WON' : didOppWin ? 'LOST' : 'DRAW'}
          </span>
        </div>
      );
    }

    if (isSlotCurrent) {
      return (
        <div
          key={`slot-${slotIndex}`}
          className="flex-1 p-2 rounded-xl border-2 border-amber-400 bg-amber-50/80 flex flex-col items-center justify-between text-center ring-2 ring-amber-400/40 animate-pulse shadow-sm"
        >
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 font-stats">
              #{pickNum} ACTIVE
            </span>
          </div>
          <span className="text-[10px] font-black uppercase font-stats text-slate-900">
            {isSlotMine ? 'YOUR PICK' : `${pickerLabel}`}
          </span>
          <span className="text-[8px] font-bold text-amber-700 uppercase">
            {isSlotMine ? 'Tap Below' : 'Picking...'}
          </span>
        </div>
      );
    }

    // Pending slot
    return (
      <div
        key={`slot-${slotIndex}`}
        className="flex-1 p-2 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col items-center justify-between text-center opacity-70"
      >
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-stats">
          #{pickNum}
        </span>
        <span className="text-[9px] font-bold uppercase font-stats text-slate-500">
          {pickerLabel}
        </span>
        <span className="text-[8px] text-slate-400">
          Pending
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-between py-1 px-2 sm:px-4">
      {/* ⚔️ Dual Arena Combat Area */}
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6 my-auto">
        
        {/* LEFT / CENTER ON MOBILE: YOUR CARD (Primary focus) */}
        <div className="flex flex-col items-center">
          <div className="mb-1 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
              isMyPick 
                ? 'bg-amber-400 text-slate-950 border border-amber-500 ring-2 ring-amber-400/50 animate-pulse' 
                : isMyCall
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}>
              {isMyCall && <Crown className="w-3.5 h-3.5 fill-current" />}
              <span>{myName} (YOU) {isMyPick ? '• PICKING NOW' : isMyCall ? '• CALLER' : ''}</span>
            </span>
          </div>

          <CardView
            key={`my-${myCard?.id || 'empty'}`}
            card={myCard}
            isInteractive={roundStatus === 'choosing' && isMyPick}
            isFacedown={false}
            onSelectAttribute={onSelectAttribute}
            selectedAttribute={selectedAttribute}
            usedAttributes={usedAttributes}
            duelPicks={duelPicks}
            isWinner={roundStatus === 'revealed' && myWinner}
            isLoser={roundStatus === 'revealed' && myLoser}
            playerName={myName}
            isCurrentTurn={isMyPick}
          />
        </div>

        {/* CENTER: 3-Pick Clash Controller */}
        <div className="flex flex-col items-center justify-center my-1 sm:my-2 lg:my-0 z-20 max-w-xs sm:max-w-sm w-full text-center">
          <div className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl w-full flex flex-col items-center border shadow-md transition-all ${
            roundStatus === 'revealed' 
              ? 'border-2 border-amber-400 bg-white shadow-xl' 
              : 'border-amber-300 bg-white/95'
          }`}>

            {/* Duel Header */}
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 font-stats">
                Duel {roundNumber} of {totalDuels}
              </span>
              <span className="text-[10px] sm:text-[11px] font-black uppercase text-slate-700 font-stats">
                Clashes: <span className="text-emerald-700 font-black">{myPickWins}</span> - <span className="text-rose-700 font-black">{oppPickWins}</span>
              </span>
            </div>

            {/* 3-Pick Stepper Slots (Pick 1 -> Pick 2 -> Pick 3) */}
            <div className="w-full flex items-stretch gap-1.5 mb-2.5">
              {[0, 1, 2].map((slotIdx) => renderPickSlot(slotIdx))}
            </div>

            {roundStatus === 'choosing' ? (
              <div className="w-full flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center mb-1.5 shadow-sm text-slate-950">
                  <Swords className="w-5 h-5 text-slate-950" />
                </div>

                <h2 className="text-sm sm:text-base font-black text-slate-900 font-stats tracking-wider uppercase mb-0.5">
                  {isMyPick ? `Your Turn (Pick ${currentPickNumber} of 3)` : `${opponentName}'s Turn (Pick ${currentPickNumber} of 3)`}
                </h2>

                <p className="text-[11px] text-slate-600 font-semibold mb-2 max-w-[240px]">
                  {isMyPick
                    ? currentPickNumber === 1
                      ? 'You have the call! Choose your 1st attribute.'
                      : currentPickNumber === 2
                      ? 'Your turn! Pick 2nd attribute to challenge.'
                      : 'Final Deciding Clash! Pick your 3rd attribute.'
                    : gameMode === 'ai'
                    ? 'AI Bot is selecting an attribute...'
                    : `Waiting for ${opponentName} to choose attribute...`}
                </p>

                <div className={`px-3 py-1 rounded-full border text-[10px] sm:text-xs flex items-center gap-1.5 shadow-2xs ${
                  isMyPick
                    ? 'bg-amber-100 border-amber-400 text-amber-900 font-black animate-pulse'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isMyPick ? 'bg-amber-500' : 'bg-slate-400'} animate-ping`} />
                  <span>{isMyPick ? 'Tap unused attribute on your card' : 'Opponent Choosing'}</span>
                </div>
              </div>
            ) : (
              /* Duel Result Banner */
              <div className="w-full flex flex-col items-center clash-shaking">
                <div className="my-1 text-center">
                  <h3 className={`text-sm sm:text-base font-black uppercase font-stats tracking-wide ${
                    myWinner ? 'text-emerald-700' : opponentWinner ? 'text-rose-600' : 'text-sky-700'
                  }`}>
                    {myWinner ? `🎉 Duel ${roundNumber} Won! (+1 Pt)` : opponentWinner ? `❌ Duel ${roundNumber} Lost` : `⚔️ Duel Tied (0 Pts)`}
                  </h3>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    {myWinner
                      ? `You won ${myPickWins} of 3 clashes and earn +1 Match Point!`
                      : opponentWinner
                      ? `${opponentName} won ${oppPickWins} of 3 clashes and earns +1 Point.`
                      : `3-clash duel ended in a draw (${myPickWins}-${oppPickWins}).`}
                  </p>
                </div>

                {/* Next Round Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playSelect();
                    onNextRound();
                  }}
                  className="mt-2.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-stats"
                >
                  <span>Next Duel ({countdown}s)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: OPPONENT CARD (Visible when revealed or on desktop; interactive on local mode when it's P2's turn) */}
        <div className={`${roundStatus === 'choosing' ? 'hidden lg:flex' : 'flex'} flex-col items-center`}>
          <div className="mb-1 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
              isOpponentPick 
                ? 'bg-amber-400 text-slate-950 border border-amber-500' 
                : isOpponentCall
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}>
              {isOpponentCall && <Crown className="w-3.5 h-3.5 fill-current" />}
              <span>{opponentName} {isOpponentPick ? '• PICKING NOW' : isOpponentCall ? '• CALLER' : ''}</span>
            </span>
          </div>

          <CardView
            key={`opp-${opponentCard?.id || 'empty'}`}
            card={opponentCard}
            isInteractive={gameMode === 'local' && roundStatus === 'choosing' && isOpponentPick}
            isFacedown={isOpponentFacedown}
            onSelectAttribute={onSelectAttribute}
            selectedAttribute={selectedAttribute}
            usedAttributes={usedAttributes}
            duelPicks={duelPicks}
            isWinner={roundStatus === 'revealed' && opponentWinner}
            isLoser={roundStatus === 'revealed' && opponentLoser}
            playerName={opponentName}
            isCurrentTurn={isOpponentPick}
          />
        </div>

      </div>

      {/* 📜 SCROLLABLE SQUAD SEQUENCE TRAY (All 25 Cards in sequence) */}
      <div className="w-full mt-3 p-2.5 sm:p-3 rounded-2xl bg-white/95 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-black text-slate-900 uppercase font-stats tracking-wider">
              Squad Sequence
            </span>
            <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
              {myDeck.length} Cards Remaining (Scroll ➔)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Scroll to preview upcoming players in order
          </span>
        </div>

        {/* Horizontal scroll container */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 px-0.5 scrollbar-thin scroll-smooth">
          {myDeck.map((c, index) => {
            const isCurrentActive = index === 0;
            const duelNum = roundNumber + index;
            const eaId = c.imageUrl ? (c.imageUrl.match(/(\d+)(?:_en-GB)?\.webp/) || [])[1] : c.id;
            const imgUrl = c.imageUrl || `https://ratings-images-prod.pulse.ea.com/FC27/components/items/${eaId}_en-GB.webp`;

            return (
              <div
                key={`deck-seq-${c.id}-${index}`}
                className={`shrink-0 w-24 sm:w-28 rounded-xl p-1.5 transition-all border relative flex flex-col items-center ${
                  isCurrentActive
                    ? 'bg-amber-50 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-sm transform -translate-y-0.5'
                    : 'bg-slate-50 hover:bg-white border-slate-200 opacity-90'
                }`}
              >
                {/* Duel number badge */}
                <div className="w-full flex items-center justify-between mb-0.5">
                  <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded font-stats ${
                    isCurrentActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isCurrentActive ? 'ACTIVE' : `#${duelNum}`}
                  </span>
                  <span className="text-[9px] font-black font-stats text-slate-900">
                    {c.stats.ovr}
                  </span>
                </div>

                {/* Player thumbnail */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center my-0.5 relative shadow-2xs">
                  <img
                    src={imgUrl}
                    alt={c.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      if (eaId) {
                        e.target.src = `https://cdn.futbin.com/content/fifa25/img/players/${eaId}.png`;
                      }
                    }}
                  />
                </div>

                {/* Name & Position */}
                <div className="w-full text-center truncate">
                  <div className="text-[10px] font-extrabold text-slate-900 truncate">
                    {c.name}
                  </div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase">
                    {c.position}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
