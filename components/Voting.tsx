
import React, { useState } from 'react';
import { Player, Role, VoteResult } from '../types';
import { soundService } from '../services/soundService';

interface VotingProps {
  players: Player[];
  onSelect: (selected: Player) => void;
  soundEnabled: boolean;
}

const Voting: React.FC<VotingProps> = ({ players, onSelect, soundEnabled }) => {
  const evilRoles = [Role.IMPOSTER, Role.MR_WHITE];
  const neutralRoles = [Role.MERCENARY];
  const goodRoles = [Role.NEIGHBOR, Role.HUNTER, Role.SEER];
  const totalEvilCount = players.filter(p => evilRoles.includes(p.role)).length;
  const targetCount = totalEvilCount > 0 ? totalEvilCount : 1;

  const [votingPhase, setVotingPhase] = useState<'collection' | 'results'>('collection');
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [votes, setVotes] = useState<VoteResult[]>([]);
  const [currentVote, setCurrentVote] = useState<string>('');

  const currentVoter = players[currentVoterIndex];

  const handleVote = (targetId: string) => {
    if (!currentVoter || currentVote) return;
    
    if (soundEnabled) soundService.playClick();
    
    const newVote: VoteResult = {
      playerId: currentVoter.id,
      targetId,
      isRevealed: false
    };
    
    setVotes(prev => [...prev, newVote]);
    setCurrentVote(targetId);
  };

  const nextVoter = () => {
    if (currentVoterIndex < players.length - 1) {
      setCurrentVoterIndex(prev => prev + 1);
      setCurrentVote('');
    } else {
      // All votes collected, show results
      setVotingPhase('results');
    }
  };

  const revealVotes = () => {
    setVotes(prev => prev.map(v => ({ ...v, isRevealed: true })));
  };

  const determineWinCondition = (selectedPlayers: Player[]): { winner: Player; reason: string } | null => {
    // Check for Saboteur first (highest priority)
    const saboteur = selectedPlayers.find(p => p.role === Role.SABOTEUR);
    if (saboteur) {
      return {
        winner: saboteur,
        reason: `${saboteur.name} was Saboteur! Chaos victory.`
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
    const innocentSelected = selectedPlayers.find(p => !evilRoles.includes(p.role) && !neutralRoles.includes(p.role));
    if (innocentSelected) {
      return {
        winner: innocentSelected,
        reason: `Eliminated ${innocentSelected.name} (Innocent). Surveillance failure.`
      };
    }

    // Check if Mercenary was selected (neutral win)
    const mercenarySelected = selectedPlayers.find(p => p.role === Role.MERCENARY);
    if (mercenarySelected) {
      return {
        winner: mercenarySelected,
        reason: `${mercenarySelected.name} (Mercenary) survived to the end! Neutral victory.`
      };
    }

    // Partial evil selection (not all evil players caught)
    if (selectedPlayers.length > 0 && selectedPlayers.length < targetCount) {
      // Find any innocent player to trigger imposter win
      const anyInnocent = players.find(p => !evilRoles.includes(p.role) && !neutralRoles.includes(p.role));
      if (anyInnocent) {
        return {
          winner: anyInnocent,
          reason: `Failed to identify all hostile agents. Security compromised.`
        };
      }
    }

    return null;
  };

  const eliminateMostVoted = () => {
    // Count votes for each target
    const voteCounts: { [key: string]: number } = {};
    votes.forEach(vote => {
      voteCounts[vote.targetId] = (voteCounts[vote.targetId] || 0) + 1;
    });

    // Find the player with the most votes
    let maxVotes = 0;
    let selectedPlayerId = '';
    
    Object.entries(voteCounts).forEach(([playerId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        selectedPlayerId = playerId;
      }
    });

    // Find the selected player and call onSelect
    const selectedPlayer = players.find(p => p.id === selectedPlayerId);
    if (selectedPlayer) {
      onSelect(selectedPlayer);
    }
  };

  const getVoteDisplay = (voterId: string, targetId: string) => {
    const voter = players.find(p => p.id === voterId);
    const target = players.find(p => p.id === targetId);
    return `${voter?.name} → ${target?.name}`;
  };

  if (votingPhase === 'collection') {
    return (
      <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-500">
        <div className="text-center">
          <h2 className="text-3xl font-black text-indigo-400 uppercase tracking-tighter">Secret Vote</h2>
          <p className="text-slate-400 text-sm font-bold">
            Pass the phone to vote secretly
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl">
              <span className="text-2xl font-black text-white">
                {currentVoter?.name?.charAt(0) || '?'}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-100">
              {currentVoter?.name}'s Turn
            </h3>
            <p className="text-slate-400 text-sm">
              Choose who to eliminate
            </p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            {players.map(player => (
              <button
                key={player.id}
                onClick={() => handleVote(player.id)}
                disabled={currentVote !== '' || player.id === currentVoter?.id}
                className={`w-full p-4 border-2 rounded-2xl transition-all text-left active:scale-95 ${
                  currentVote === player.id
                    ? 'bg-pink-600 border-pink-400 shadow-lg shadow-pink-500/20'
                    : 'bg-slate-800 border-slate-700 hover:border-indigo-500'
                } ${
                  player.id === currentVoter?.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentVote === player.id
                      ? 'bg-white text-pink-600'
                      : 'bg-slate-900 text-slate-400'
                  }`}>
                    {currentVote === player.id ? '✓' : player.id.split('-')[1]}
                  </div>
                  <span className={`font-bold text-sm truncate ${
                    currentVote === player.id ? 'text-white' : 'text-slate-200'
                  }`}>
                    {player.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {currentVote && (
            <button
              onClick={nextVoter}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl border-b-4 border-indigo-900 active:scale-95 transition-all"
            >
              Confirm Vote & Pass Phone
            </button>
          )}
        </div>
      </div>
    );
  }

  // Results Phase
  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-500 relative">
      <div className="text-center">
        <h2 className="text-3xl font-black text-indigo-400 uppercase tracking-tighter">The Purge</h2>
        <p className="text-slate-400 text-sm font-bold">
          Select <span className="text-pink-500 text-lg">{targetCount}</span> hostile agents.
          {targetCount === 1 && <span className="text-xs text-slate-500">(Saboteur wins if voted out)</span>}
        </p>
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        {!votes.every(v => v.isRevealed) ? (
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={revealVotes}
              className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-2xl shadow-xl border-b-4 border-indigo-900 active:scale-95 transition-all"
            >
              Reveal All Votes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {votes.map((vote, index) => (
              <div
                key={index}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-4 animate-in fade-in duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-center">
                  <span className="text-lg font-bold text-slate-100">
                    {getVoteDisplay(vote.playerId, vote.targetId)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {votes.every(v => v.isRevealed) && (
        <div className="space-y-3">
          <button
            onClick={eliminateMostVoted}
            className="w-full py-4 bg-pink-600 text-white rounded-2xl font-bold shadow-xl border-b-4 border-pink-900 active:scale-95 transition-all"
          >
            Eliminate Player
          </button>
        </div>
      )}
    </div>
  );
};

export default Voting;
