
import React from 'react';
import { Player } from '../types';

interface InquestRevealViewProps {
  players: Player[];
  round: number;
  question: string;
  onNext: () => void;
}

const InquestRevealView: React.FC<InquestRevealViewProps> = ({ players, round, question, onNext }) => {
  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest">Cross-Examination</h2>
        <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl">
            <p className="text-lg font-bold text-indigo-100">"{question}"</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {players.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-slate-400 shrink-0">
                {p.name.split(' ')[1]}
            </div>
            <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{p.name} LOCKED IN:</div>
                <div className="text-lg font-black text-white">{p.inquestAnswers[round]}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-pink-900/10 border border-pink-500/20 rounded-xl">
        <p className="text-xs text-center text-pink-400 font-medium italic">
          Scrutinize the answers! Why did they pick that? The Imposter may be guessing.
        </p>
      </div>

      <button 
        onClick={onNext}
        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-xl shadow-xl transition-all active:scale-95"
      >
        {round < 2 ? 'NEXT QUESTION' : 'FINAL VOTE'}
      </button>
    </div>
  );
};

export default InquestRevealView;
