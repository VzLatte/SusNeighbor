
import React, { useState } from 'react';
import { HistoryEntry, Role } from '../types';

interface LeaderboardProps {
  points: { [name: string]: number };
  history: HistoryEntry[];
  onBack: () => void;
  onClear: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ points, history, onBack, onClear }) => {
  const [activeTab, setActiveTab] = useState<'STANDINGS' | 'HISTORY'>('STANDINGS');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const sortedPoints = Object.entries(points)
    // Fix: Explicitly cast to number to ensure arithmetic operations are valid for sort
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 50);

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in slide-in-from-bottom duration-500 pb-8">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-black text-indigo-400 tracking-tighter">HALL OF FAME</h2>
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Confidential Player Records</p>
      </div>

      <div className="flex bg-slate-800 p-1 rounded-xl shrink-0">
        <button 
          onClick={() => setActiveTab('STANDINGS')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'STANDINGS' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
        > Standings </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'HISTORY' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
        > History </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {activeTab === 'STANDINGS' ? (
          <div className="space-y-2">
            {sortedPoints.length === 0 ? (
              <div className="text-center py-20 text-slate-600 italic text-sm">No records found. Start playing!</div>
            ) : (
              sortedPoints.map(([name, pts], idx) => (
                <div key={name} className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <span className={`w-6 text-center font-black ${idx < 3 ? 'text-indigo-400' : 'text-slate-600'}`}>#{idx + 1}</span>
                    <span className="font-bold">{name}</span>
                  </div>
                  <div className="font-black text-indigo-400">{pts} <span className="text-[10px] text-slate-600">PTS</span></div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-20 text-slate-600 italic text-sm">No mission history available.</div>
            ) : (
              history.map(entry => (
                <div key={entry.id} className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${
                        entry.winner === 'NEIGHBORS' ? 'text-indigo-400' : 
                        entry.winner === 'IMPOSTERS' ? 'text-pink-500' : 
                        'text-teal-400'
                      }`}>
                        {entry.winner} Win
                      </div>
                      <div className="text-[8px] text-slate-500 font-bold">{entry.date} • {entry.mode}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-tight font-medium italic">"{entry.reason}"</p>
                  <div className="flex flex-wrap gap-1">
                     {entry.players.map((p, i) => (
                       <div key={i} className="text-[8px] px-1.5 py-0.5 bg-slate-900/50 rounded text-slate-400">
                          {p.name} ({p.role[0]})
                       </div>
                     ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button 
            onClick={onBack}
            className="flex-1 py-4 bg-slate-800 border-2 border-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest"
        > Back to Base </button>
        <button 
            onClick={() => setShowClearConfirm(true)}
            className="px-6 py-4 bg-pink-900/20 text-pink-600 border border-pink-900/40 rounded-2xl font-black text-xs uppercase"
        > Clear </button>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-6 backdrop-blur-sm">
           <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-sm text-center shadow-2xl animate-in zoom-in duration-200">
              <h3 className="text-2xl font-black mb-2 text-pink-500">Purge Records?</h3>
              <p className="text-slate-400 text-sm mb-6 font-medium">This will wipe all player points and mission logs permanently.</p>
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setShowClearConfirm(false)} className="py-3 bg-slate-800 rounded-xl font-bold">Cancel</button>
                 <button onClick={() => { onClear(); setShowClearConfirm(false); }} className="py-3 bg-pink-600 text-white rounded-xl font-bold">Purge</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
