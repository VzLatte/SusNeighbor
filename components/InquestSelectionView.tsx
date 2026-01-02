
import React, { useMemo } from 'react';
import { Player } from '../types';

interface InquestSelectionViewProps {
  player: Player;
  options: string[];
  onSelect: (answer: string) => void;
}

const InquestSelectionView: React.FC<InquestSelectionViewProps> = ({ player, options, onSelect }) => {
  // Shuffling logic ensures that A, B, C, D labels are randomized per player turn
  const shuffledOptions = useMemo(() => {
    const arr = [...options];
    // Fisher-Yates Shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [options, player.id]); 

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-right duration-300">
      <div className="text-center">
        <h2 className="text-3xl font-black text-indigo-500">{player.name}</h2>
        <p className="text-slate-400 uppercase tracking-widest text-xs mt-2">Commit your answer</p>
      </div>

      <div className="w-full grid grid-cols-1 gap-3">
        {shuffledOptions.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(opt)}
            className="p-6 bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 rounded-2xl text-left font-bold text-lg active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-black text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-950 transition-colors">
                    {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt}</span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-600 italic text-center px-8">
        Once you tap, the phone will be passed to the next player. Keep your choice hidden until the reveal!
      </p>
    </div>
  );
};

export default InquestSelectionView;
