import React, { useState, useMemo } from 'react';
import { Search, X, Filter, Award, Sparkles, Trophy } from 'lucide-react';
import { ATTRIBUTES } from '../constants/attributes';

export default function CardGalleryModal({ players, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const positions = useMemo(() => {
    const set = new Set();
    players.forEach(p => { if (p.position) set.add(p.position); });
    return ['ALL', ...Array.from(set).sort()];
  }, [players]);

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.nationality.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPos = posFilter === 'ALL' || p.position === posFilter;
      return matchSearch && matchPos;
    });
  }, [players, searchTerm, posFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="card-elevated w-full max-w-5xl h-[88vh] rounded-3xl border border-slate-200 flex flex-col overflow-hidden bg-white shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black font-stats text-lg shadow-sm">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-stats uppercase tracking-wider flex items-center gap-2">
                Card Codex <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">{filteredPlayers.length} Stars</span>
              </h2>
              <p className="text-xs text-slate-500">
                Explore the official EA Sports FC ratings & player cards database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters Bar */}
        <div className="p-3.5 border-b border-slate-200 bg-white flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by player, club, nation (Mbappé, Real Madrid, Spain...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-amber-600 shrink-0" />
            {positions.slice(0, 10).map((pos) => (
              <button
                key={pos}
                onClick={() => setPosFilter(pos)}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-stats transition-all shrink-0 cursor-pointer ${
                  posFilter === pos
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 bg-slate-50/50">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className="group card-elevated p-2.5 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg bg-white relative overflow-hidden flex flex-col justify-between"
            >
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-50 mb-2 flex items-center justify-center border border-slate-100">
                <img
                  src={player.imageUrl}
                  alt={player.name}
                  className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-white/95 backdrop-blur-sm text-[11px] font-black font-stats text-slate-900 border border-amber-300 shadow-xs">
                  {player.stats.ovr}
                </div>
                <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-white/95 backdrop-blur-sm text-[10px] font-bold text-slate-700 border border-slate-200 shadow-xs">
                  {player.position}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                  {player.name}
                </h4>
                <div className="text-[10px] text-slate-500 truncate">
                  {player.team}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-slate-100 text-center">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold">PAC</span>
                  <span className="text-[11px] font-black text-slate-800 font-stats">{player.stats.pac}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold">SHO</span>
                  <span className="text-[11px] font-black text-slate-800 font-stats">{player.stats.sho}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold">DRI</span>
                  <span className="text-[11px] font-black text-slate-800 font-stats">{player.stats.dri}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Single Player Detailed Inspection Card Popup */}
        {selectedPlayer && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="card-elevated p-6 rounded-3xl border border-amber-400 max-w-sm w-full bg-white relative shadow-2xl">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-3">
                <span className="text-xs font-bold text-amber-700 tracking-wider uppercase font-stats">
                  {selectedPlayer.position} • {selectedPlayer.team}
                </span>
                <h3 className="text-xl font-black text-slate-900">{selectedPlayer.name}</h3>
                <span className="text-xs text-slate-500">{selectedPlayer.nationality}</span>
              </div>

              <div className="w-full h-44 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 p-2 overflow-hidden border border-slate-200 shadow-inner">
                <img
                  src={selectedPlayer.imageUrl}
                  alt={selectedPlayer.name}
                  className="w-full h-full object-contain filter drop-shadow-md"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              </div>

              <div className="space-y-1.5">
                {ATTRIBUTES.map((attr) => {
                  const Icon = attr.Icon;
                  return (
                    <div key={attr.key} className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: attr.color }} />
                        <span className="text-slate-700 font-bold">{attr.label}</span>
                      </div>
                      <span className="font-stats font-black text-slate-900 text-sm">
                        {selectedPlayer.stats[attr.key]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
