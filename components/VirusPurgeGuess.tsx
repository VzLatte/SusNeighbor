import React, { useState } from 'react';
import { GameContext } from '../types';
import { soundService } from '../services/soundService';

interface VirusPurgeGuessProps {
  context: GameContext;
  onResult: (correct: boolean) => void;
  soundEnabled: boolean;
}

const VirusPurgeGuess: React.FC<VirusPurgeGuessProps> = ({ context, onResult, soundEnabled }) => {
  const [guess, setGuess] = useState('');

  const handleSubmit = () => {
    if (!guess.trim()) return;
    if (soundEnabled) soundService.playLockIn();
    const isCorrect = guess.toLowerCase().trim() === context.virusWord?.toLowerCase().trim();
    onResult(isCorrect);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in zoom-in duration-500">
      <div className="text-center space-y-4 w-full">
        <div className="inline-block px-4 py-1.5 bg-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-2 shadow-lg shadow-teal-500/20">Final Purge Sequence</div>
        <h2 className="text-3xl font-black text-slate-100">IDENTIFY THE VIRUS</h2>
        <p className="text-slate-400 text-sm px-6">Based on the noise words provided by the system, what was the secret virus word?</p>
      </div>

      <div className="w-full space-y-6">
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Analysis History</label>
            <div className="grid grid-cols-3 gap-2">
               {context.noiseWords?.map(w => (
                 <div key={w} className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-center opacity-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{w}</span>
                 </div>
               ))}
            </div>
        </div>

        <input 
          type="text" 
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="ENTER VIRUS CODE..."
          className="w-full bg-slate-900 border-2 border-teal-500/30 p-5 rounded-3xl text-center font-black text-xl uppercase text-teal-400 focus:border-teal-500 outline-none transition-all placeholder:text-slate-700"
        />

        <button 
          onClick={handleSubmit}
          className="w-full py-6 bg-teal-600 text-white rounded-3xl font-black text-2xl shadow-xl shadow-teal-500/30 active:scale-95 border-b-4 border-teal-900"
        >
          EXECUTE PURGE
        </button>
      </div>

      <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest text-center">One attempt only. The integrity of the system depends on this.</p>
    </div>
  );
};

export default VirusPurgeGuess;