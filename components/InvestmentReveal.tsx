
import React from 'react';
import { Player } from '../types';

interface InvestmentRevealProps {
  players: Player[];
  categories: string[];
  onNext: () => void;
}

const InvestmentReveal: React.FC<InvestmentRevealProps> = ({ players, categories, onNext }) => {
  const totalSpendByCategory = categories.reduce((acc, cat) => {
    acc[cat] = players.reduce((sum, p) => sum + (p.investmentSpend?.[cat] || 0), 0);
    return acc;
  }, {} as { [key: string]: number });

  // Fix: Explicitly cast Object.values to number[] to satisfy Math.max
  const maxTotal = Math.max(...(Object.values(totalSpendByCategory) as number[]), 1);

  return (
    <div className="flex-1 flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-indigo-400">GROUP INVESTMENT</h2>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Total Personnel Allocation</p>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6">
         {categories.map(cat => (
           <div key={cat} className="space-y-2">
              <div className="flex justify-between items-end px-1">
                 <span className="font-black text-sm uppercase tracking-wider text-slate-200">{cat}</span>
                 <span className="font-black text-xl text-indigo-400">{totalSpendByCategory[cat]} <span className="text-[10px] text-slate-500 uppercase">Points</span></span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                 <div 
                   className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000"
                   style={{ width: `${(totalSpendByCategory[cat] / (players.length * 10)) * 100}%` }}
                 />
              </div>
           </div>
         ))}

         <div className="mt-8 p-6 bg-slate-800/40 rounded-3xl border border-slate-700 border-dashed text-center">
            <p className="text-xs text-slate-400 leading-relaxed italic">
              Compare these totals to your own project's needs. If a category like <span className="text-indigo-300 font-bold">Technology</span> has higher-than-expected funding, an Imposter might be among you.
            </p>
         </div>
      </div>

      <button 
        onClick={onNext}
        className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl active:scale-95 border-b-4 border-indigo-900"
      >
        START DEBATE
      </button>
    </div>
  );
};

export default InvestmentReveal;
