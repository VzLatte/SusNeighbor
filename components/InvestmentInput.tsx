
import React, { useState } from 'react';
import { Player, InvestmentSpend } from '../types';
import { soundService } from '../services/soundService';

interface InvestmentInputProps {
  player: Player;
  categories: string[];
  onSubmit: (spend: InvestmentSpend) => void;
  soundEnabled: boolean;
}

const InvestmentInput: React.FC<InvestmentInputProps> = ({ player, categories, onSubmit, soundEnabled }) => {
  const [spend, setSpend] = useState<InvestmentSpend>(() => {
    const initial: InvestmentSpend = {};
    categories.forEach(cat => initial[cat] = 0);
    return initial;
  });

  const totalPoints = 10;
  const currentTotal = Object.values(spend).reduce((a: number, b: number) => a + b, 0);
  const remaining = totalPoints - (currentTotal as number);

  const updateSpend = (cat: string, val: number) => {
    const currentVal = spend[cat];
    const diff = val - currentVal;
    
    if (diff > remaining) return; // Can't exceed budget
    if (val < 0) return; // Can't be negative

    if (soundEnabled) soundService.playClick();
    setSpend({ ...spend, [cat]: val });
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 animate-in slide-in-from-right duration-300">
      <div className="text-center">
        <h2 className="text-3xl font-black text-indigo-500">{player.name}</h2>
        <p className="text-slate-400 uppercase tracking-widest text-xs mt-2">Allocate Budget Points (Total: {totalPoints})</p>
      </div>

      <div className="flex-1 space-y-6">
         <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <span className="font-bold text-slate-300">Remaining Budget</span>
            <span className={`text-2xl font-black ${remaining === 0 ? 'text-green-500' : 'text-indigo-400'}`}>{remaining}</span>
         </div>

         <div className="space-y-4">
            {categories.map(cat => (
              <div key={cat} className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="font-black text-xs uppercase tracking-wider text-slate-400">{cat}</span>
                    <span className="font-black text-lg text-white">{spend[cat]}</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <button 
                        disabled={spend[cat] <= 0}
                        onClick={() => updateSpend(cat, spend[cat] - 1)}
                        className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-black text-2xl disabled:opacity-30"
                    >-</button>
                    <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-indigo-500 transition-all duration-300" 
                         style={{ width: `${(spend[cat] / totalPoints) * 100}%` }}
                       />
                    </div>
                    <button 
                        disabled={remaining <= 0}
                        onClick={() => updateSpend(cat, spend[cat] + 1)}
                        className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-black text-2xl disabled:opacity-30"
                    >+</button>
                 </div>
              </div>
            ))}
         </div>
      </div>

      <button 
        disabled={remaining !== 0}
        onClick={() => {
          if (soundEnabled) soundService.playLockIn();
          onSubmit(spend);
        }}
        className={`w-full py-5 rounded-3xl font-black text-xl transition-all ${
          remaining === 0 
            ? 'bg-indigo-600 text-white shadow-xl active:scale-95 border-b-4 border-indigo-900' 
            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
        }`}
      >
        SUBMIT SPEND
      </button>
    </div>
  );
};

export default InvestmentInput;
