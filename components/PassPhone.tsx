
import React, { useEffect } from 'react';
import { Player } from '../types';
import { soundService } from '../services/soundService';

interface PassPhoneProps {
  nextPlayer: Player;
  onConfirm: () => void;
  soundEnabled: boolean;
}

const PassPhone: React.FC<PassPhoneProps> = ({ nextPlayer, onConfirm, soundEnabled }) => {
  useEffect(() => {
    if (soundEnabled) {
      soundService.playPass();
    }
  }, [soundEnabled, nextPlayer.id]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-300">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto border-4 border-slate-700">
          <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black">Pass the Phone</h2>
        <p className="text-slate-400 text-lg">Hand the device to:</p>
        <div className="text-5xl font-black text-indigo-500 py-2">{nextPlayer.name}</div>
      </div>

      <button 
        onClick={onConfirm}
        className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform"
      >
        I AM {nextPlayer.name.toUpperCase()}
      </button>
    </div>
  );
};

export default PassPhone;
