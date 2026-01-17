
import React, { useState } from 'react';
import { Player, Role } from '../types';
import { soundService } from '../services/soundService';

interface VotingProps {
  players: Player[];
  onSelect: (selected: Player) => void; // Keeping signature for backward compat, but internally we handle logic
  soundEnabled: boolean;
}

const Voting: React.FC<VotingProps> = ({ players, onSelect, soundEnabled }) => {
  const evilRoles = [Role.IMPOSTER, Role.MR_WHITE, Role.MIMIC];
  const totalEvilCount = players.filter(p => evilRoles.includes(p.role)).length;
  const targetCount = totalEvilCount > 0 ? totalEvilCount : 1;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSelectRequest = (player: Player) => {
    if (!player || !players.find(p => p.id === player.id)) return;
    
    soundService.playClick();
    if (selectedIds.includes(player.id)) {
        setSelectedIds(prev => prev.filter(id => id !== player.id));
    } else {
        if (selectedIds.length < targetCount) {
            setSelectedIds(prev => [...prev, player.id]);
        }
    }
  };

  const determineWinCondition = (selectedPlayers: Player[]): { winner: Player; reason: string } | null => {
    // Check for Anarchist first (highest priority)
    const anarchist = selectedPlayers.find(p => p.role === Role.ANARCHIST);
    if (anarchist) {
      return {
        winner: anarchist,
        reason: `${anarchist.name} was the Anarchist! Rogue victory.`
      };
    }

    // Check if all selected are evil and we caught the full team
    const allEvil = selectedPlayers.every(p => evilRoles.includes(p.role));
    const caughtAllEvil = selectedPlayers.length === targetCount && allEvil;
    
    if (caughtAllEvil) {
      // Neighbors win - pass first evil player to trigger neighbor win logic
      const evilPlayer = selectedPlayers.find(p => evilRoles.includes(p.role));
      if (evilPlayer) {
        return {
          winner: evilPlayer,
          reason: `All hostile agents identified! Neighbors win.`
        };
      }
    }

    // Check if any innocent was selected
    const innocentSelected = selectedPlayers.find(p => !evilRoles.includes(p.role));
    if (innocentSelected) {
      return {
        winner: innocentSelected,
        reason: `Eliminated ${innocentSelected.name} (Innocent). Surveillance failure.`
      };
    }

    // Partial evil selection (not all evil players caught)
    if (selectedPlayers.length > 0 && selectedPlayers.length < targetCount) {
      // Find any innocent player to trigger imposter win
      const anyInnocent = players.find(p => !evilRoles.includes(p.role));
      if (anyInnocent) {
        return {
          winner: anyInnocent,
          reason: `Failed to identify all hostile agents. Security compromised.`
        };
      }
    }

    return null;
  };

  const handleConfirm = () => {
    if (!players || players.length === 0) return;
    
    const selectedPlayers = players.filter(p => selectedIds.includes(p.id));
    
    if (selectedPlayers.length === 0) return;
    
    const result = determineWinCondition(selectedPlayers);
    if (result && result.winner) {
      onSelect(result.winner);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-500 relative">
      <div className="text-center">
        <h2 className="text-3xl font-black text-indigo-400 uppercase tracking-tighter">The Purge</h2>
        <p className="text-slate-400 text-sm font-bold">
          Select <span className="text-pink-500 text-lg">{targetCount}</span> hostile agents.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-20 overflow-y-auto pr-1 custom-scrollbar">
        {players.map(player => {
          const isSelected = selectedIds.includes(player.id);
          return (
            <button
              key={player.id}
              onClick={() => handleSelectRequest(player)}
              className={`p-4 border-2 rounded-2xl transition-all text-left group active:scale-95 relative overflow-hidden ${
                isSelected 
                  ? 'bg-pink-600 border-pink-400 shadow-lg shadow-pink-500/20' 
                  : 'bg-slate-800 border-slate-700 hover:border-indigo-500'
              }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-white text-pink-600' : 'bg-slate-900 text-slate-400'
                }`}>
                  {isSelected ? '✓' : player.id.split('-')[1]}
                </div>
                <span className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {player.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="fixed bottom-6 left-6 right-6">
          <button 
            disabled={selectedIds.length !== targetCount}
            onClick={() => {
                if (soundEnabled) soundService.playLockIn();
                handleConfirm();
            }}
            className={`w-full py-5 rounded-3xl font-black text-xl shadow-xl transition-all border-b-4 ${
                selectedIds.length === targetCount
                ? 'bg-indigo-600 border-indigo-900 text-white active:scale-95'
                : 'bg-slate-800 border-slate-900 text-slate-600 cursor-not-allowed'
            }`}
          >
            {selectedIds.length === targetCount ? 'CONFIRM TARGETS' : `SELECT ${targetCount}`}
          </button>
      </div>
    </div>
  );
};

export default Voting;
