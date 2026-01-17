import React from 'react';
import { Player, Role } from '../types';

interface ResultsProps {
  outcome: { winner: 'NEIGHBORS' | 'IMPOSTERS' | 'HUMANS' | 'VIRUS', reason: string };
  players: Player[];
  allTimePoints: { [name: string]: number };
  onReset: () => void;
}

const Results: React.FC<ResultsProps> = ({ outcome, players, allTimePoints, onReset }) => {
  const getWinnerColor = () => {
    switch(outcome.winner) {
      case 'NEIGHBORS': return 'text-indigo-500';
      case 'IMPOSTERS': return 'text-pink-500';
      case 'HUMANS': return 'text-teal-500';
      case 'VIRUS': return 'text-pink-600';
      default: return 'text-white';
    }
  };

  const getWinnerLabel = () => {
    switch(outcome.winner) {
      case 'NEIGHBORS': return 'VICTORY';
      case 'IMPOSTERS': return 'DEFEAT';
      case 'HUMANS': return 'PURGED';
      case 'VIRUS': return 'BREACHED';
      default: return 'END';
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.NEIGHBOR:
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case Role.IMPOSTER:
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case Role.MR_WHITE:
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const checkWon = (p: Player) => {
    if (outcome.winner === 'HUMANS') return true;
    if (outcome.winner === 'VIRUS') return false;
    if (outcome.winner === 'NEIGHBORS' && p.role === Role.NEIGHBOR) return true;
    if (outcome.winner === 'IMPOSTERS' && (p.role === Role.IMPOSTER || p.role === Role.MR_WHITE)) return true;
    return false;
  };
  
  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-top duration-500 pb-8">
      <div className="text-center space-y-4">
        <div className={`text-6xl font-black ${getWinnerColor()} tracking-tighter`}>
          {getWinnerLabel()}
        </div>
        <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
          <p className="text-lg font-bold leading-tight">{outcome.reason}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-1">Operational Debrief</h3>
        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
          {players.map(p => {
            const hasWon = checkWon(p);
            return (
              <div key={p.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800/50">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{p.name}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1.5 ${
                      p.role === Role.IMPOSTER ? 'bg-pink-500/20 text-pink-500' : 
                      p.role === Role.MR_WHITE ? 'bg-yellow-500/20 text-yellow-500' : 
                      'bg-indigo-500/20 text-indigo-500'
                    }`}>
                      {getRoleIcon(p.role)}
                      {p.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 italic">
                    {p.role === Role.MR_WHITE ? '[Unknown]' : (p.assignedProject2 ? `${p.assignedProject} + ${p.assignedProject2}` : p.assignedProject)}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <div className={`text-xs font-black ${hasWon ? 'text-green-500' : 'text-slate-600'}`}>
                      {hasWon ? 'MISSION COMPLETE' : 'MISSION FAILED'}
                   </div>
                   <div className="text-[9px] font-bold text-slate-500">
                      Total Points: {allTimePoints[p.name] || 0}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button 
        onClick={onReset}
        className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-indigo-500/30 active:scale-95 transition-transform border-b-4 border-indigo-900"
      >
        NEXT OPERATION
      </button>
    </div>
  );
};

export default Results;