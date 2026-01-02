
import React, { useState } from 'react';
import { Player } from '../types';
import { soundService } from '../services/soundService';

interface VotingProps {
  players: Player[];
  onSelect: (player: Player) => void;
}

const Voting: React.FC<VotingProps> = ({ players, onSelect }) => {
  const [confirmingPlayer, setConfirmingPlayer] = useState<Player | null>(null);

  const handleSelectRequest = (player: Player) => {
    soundService.playClick();
    setConfirmingPlayer(player);
  };

  const handleConfirm = () => {
    if (confirmingPlayer) {
      soundService.playLockIn();
      onSelect(confirmingPlayer);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-500 relative">
      <div className="text-center">
        <h2 className="text-3xl font-black">Who is it?</h2>
        <p className="text-slate-400">Point at the person with the most votes</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {players.map(player => (
          <button
            key={player.id}
            onClick={() => handleSelectRequest(player)}
            className="p-4 bg-slate-800 border-2 border-slate-700 rounded-2xl hover:border-indigo-500 hover:bg-slate-700/50 transition-all text-left group active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center font-bold text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500 transition-colors">
                {player.id.split('-')[1]}
              </div>
              <span className="font-bold text-lg truncate">{player.name}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <p className="text-xs text-yellow-500 text-center font-medium">
          If you eliminate a Neighbor, the Imposters win instantly!
        </p>
      </div>

      {/* Confirmation Modal */}
      {confirmingPlayer && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
           <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl space-y-6 animate-in zoom-in duration-300">
              <div className="text-center space-y-2">
                 <h3 className="text-xl font-black uppercase tracking-tighter text-indigo-400">Confirm Elimination</h3>
                 <div className="w-12 h-1 bg-indigo-500/20 mx-auto rounded-full" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed text-center font-medium">
                Are you sure you want to eliminate <span className="text-white font-black">{confirmingPlayer.name}</span>?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setConfirmingPlayer(null)} 
                  className="py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm} 
                  className="py-4 bg-pink-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
                >
                  Eliminate
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Voting;
