import React, { useState, useEffect } from 'react';
import { GameContext, MainMode, Player, Role } from '../types';
import { soundService } from '../services/soundService';

interface MeetingProps {
  context: GameContext;
  players: Player[];
  onTimerEnd: () => void;
  onPlayerComplete: (playerId: string) => void;
  duration: number;
  soundEnabled: boolean;
  virusPoints?: number;
  onDetection?: () => void;
}

const Meeting: React.FC<MeetingProps> = ({ 
  context, 
  players, 
  onTimerEnd, 
  onPlayerComplete, 
  duration, 
  soundEnabled, 
  virusPoints = 0, 
  onDetection 
}) => {
  const [seconds, setSeconds] = useState(duration);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [completedPlayers, setCompletedPlayers] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundSeconds, setRoundSeconds] = useState(60);

  const currentPlayer = players[currentPlayerIndex];
  const isVirusMode = context.mainMode === MainMode.VIRUS_PURGE;

  // Round durations (default values)
  const roundDurations = {
    1: 90, // Statements
    2: 60, // Debate
    3: 45  // Defense
  };

  const currentRoundDuration = roundDurations[currentRound as keyof typeof roundDurations] || 60;

  // Find starting player index
  useEffect(() => {
    const startIndex = players.findIndex(p => p.name === context.startingPlayerName);
    if (startIndex !== -1) {
      setCurrentPlayerIndex(startIndex);
    }
  }, [players, context.startingPlayerName]);

  // Round timer logic
  useEffect(() => {
    if (roundSeconds <= 0) {
      // Move to next round or end meeting
      if (currentRound < 3) {
        setCurrentRound(prev => prev + 1);
        setRoundSeconds(roundDurations[(currentRound + 1) as keyof typeof roundDurations] || 60);
        // Reset player completion for new round
        setCompletedPlayers(new Set());
      } else {
        onTimerEnd();
      }
      return;
    }
    if (isPaused) return;

    if (soundEnabled && roundSeconds <= 10 && roundSeconds > 0) soundService.playTick();

    const timer = setInterval(() => setRoundSeconds(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [roundSeconds, isPaused, currentRound, onTimerEnd, soundEnabled]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayerDone = () => {
    if (!currentPlayer) return;
    
    if (soundEnabled) soundService.playClick();
    
    // Mark current player as completed for this round
    const newCompleted = new Set(completedPlayers);
    newCompleted.add(currentPlayer.id);
    setCompletedPlayers(newCompleted);
    
    // Notify parent
    onPlayerComplete(currentPlayer.id);
    
    // Move to next player
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    if (!newCompleted.has(players[nextIndex].id)) {
      setCurrentPlayerIndex(nextIndex);
    } else {
      // Find next uncompleted player
      let foundNext = false;
      for (let i = 0; i < players.length; i++) {
        const testIndex = (nextIndex + i) % players.length;
        if (!newCompleted.has(players[testIndex].id)) {
          setCurrentPlayerIndex(testIndex);
          foundNext = true;
          break;
        }
      }
      
      // All players completed in this round
      if (!foundNext) {
        // Move to next round
        if (currentRound < 3) {
          setCurrentRound(prev => prev + 1);
          setRoundSeconds(roundDurations[(currentRound + 1) as keyof typeof roundDurations] || 60);
          setCompletedPlayers(new Set());
        } else {
          onTimerEnd();
        }
      }
    }
  };

  const getSpeakingPrompt = (player: Player) => {
    if (isVirusMode) {
      return "Describe your signal without using detection words";
    }
    
    switch (player.role) {
      case Role.NEIGHBOR:
        return "Share your observations and defend your innocence";
      case Role.IMPOSTER:
        return "Blend in while subtly misleading group";
      case Role.MR_WHITE:
        return "Act like a neighbor while hiding your true role";
      case Role.SABOTEUR:
        return "Create chaos and disrupt the investigation";
      case Role.MERCENARY:
        return "Choose your side wisely based on intel you gather";
      case Role.HUNTER:
        return "Hunt for evil while hiding your lack of word knowledge";
      case Role.SEER:
        return "Use your blurred vision to guide the investigation";
      default:
        return "Share your thoughts on the situation";
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.NEIGHBOR: return 'text-blue-400';
      case Role.IMPOSTER: return 'text-red-400';
      case Role.MR_WHITE: return 'text-gray-400';
      case Role.SABOTEUR: return 'text-orange-400';
      case Role.MERCENARY: return 'text-purple-400';
      case Role.HUNTER: return 'text-yellow-400';
      case Role.SEER: return 'text-teal-400';
      default: return 'text-slate-400';
    }
  };

  const getRoundTitle = () => {
    switch (currentRound) {
      case 1: return "Opening Statements";
      case 2: return "Debate & Accusations";
      case 3: return "Final Defense";
      default: return "Discussion";
    }
  };

  return (
    <div className="flex-1 flex flex-col animate-in slide-in-from-bottom duration-500">
      {/* TOP BAR - Timer and Progress */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Round {currentRound}/3</span>
              <span className="text-xs font-black text-slate-400 ml-2">{getRoundTitle()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Round Time</span>
              <span className={`text-xl font-black ${roundSeconds < 30 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`}>
                {formatTime(roundSeconds)}
              </span>
            </div>
          </div>
          <button 
            onClick={() => { if (soundEnabled) soundService.playClick(); setIsPaused(!isPaused); }}
            className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-lg text-xs font-black text-slate-300 active:scale-95"
          >
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
        
        {/* Player Progress Dots */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Round Progress:</span>
          <div className="flex gap-1 flex-1">
            {players.map((player, index) => {
              const isCurrent = index === currentPlayerIndex;
              const isCompleted = completedPlayers.has(player.id);
              return (
                <div
                  key={player.id}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    isCurrent 
                      ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50' 
                      : isCompleted 
                        ? 'bg-green-500' 
                        : 'bg-slate-700'
                  }`}
                  title={player.name}
                />
              );
            })}
          </div>
          <span className="text-[10px] font-black text-slate-400">
            {completedPlayers.size}/{players.length}
          </span>
        </div>
      </div>

      {/* MAIN PLAYER SCREEN */}
      {currentPlayer && (
        <div className="flex-1 flex flex-col p-6 space-y-6">
          {/* Current Player Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-950/40 px-4 py-2 rounded-full border border-indigo-500/30">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Current Speaker:</span>
              <span className="text-sm font-black text-indigo-100">{currentPlayer.name}</span>
            </div>
            <div className={`text-xs font-black uppercase tracking-widest ${getRoleColor(currentPlayer.role)}`}>
              {currentPlayer.role}
            </div>
          </div>

          {/* Speaking Instructions */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-full max-w-sm space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-black mb-2">
                  {isVirusMode ? 'Signal Description' : 'Your Turn to Speak'}
                </h2>
                <p className="text-slate-400 text-sm font-medium">
                  {getSpeakingPrompt(currentPlayer)}
                </p>
              </div>

              {/* Player Info Card */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Your Intel</span>
                  <span className={`text-xs font-black ${getRoleColor(currentPlayer.role)}`}>
                    {currentPlayer.role}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500">Project:</span>
                    <p className="text-sm font-bold text-slate-100">{currentPlayer.assignedProject}</p>
                  </div>
                  
                  {/* Show imposter word/hint for imposters */}
                  {currentPlayer.role === Role.IMPOSTER && context.imposterProject && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-2">
                      <span className="text-[10px] font-black uppercase text-red-400">Imposter Word:</span>
                      <p className="text-sm font-bold text-red-300">{context.imposterProject}</p>
                    </div>
                  )}
                  
                  {currentPlayer.assignedProject2 && (
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-500">Secondary:</span>
                      <p className="text-sm font-bold text-slate-100">{currentPlayer.assignedProject2}</p>
                    </div>
                  )}
                  {currentPlayer.oracleInfo && (
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-500">Oracle Vision:</span>
                      <p className="text-sm font-bold text-teal-400">{currentPlayer.oracleInfo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Virus Mode Specific Content */}
              {isVirusMode && (
                <div className="space-y-3">
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${virusPoints >= i ? 'bg-pink-600 border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'bg-slate-800 border-slate-700'}`}>
                        <span className="text-[10px] font-black text-white">{virusPoints >= i ? '!' : i}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 text-center tracking-widest mb-2">⚠️ Detection Words</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {context.noiseWords?.map(w => (
                        <div key={w} className="bg-slate-800 border border-slate-700 p-2 rounded-lg text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase">{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={onDetection} 
                    className="w-full py-2 bg-pink-900/20 border border-pink-500/30 rounded-xl text-pink-500 text-[10px] font-black uppercase tracking-widest active:scale-95" 
                  >
                    🚨 Report Detection
                  </button>
                </div>
              )}

              {/* Non-Virus Mode Location Info */}
              {!isVirusMode && (
                <div className="w-full p-4 bg-slate-800 rounded-2xl border border-slate-700 text-center">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Location</span>
                  <h3 className="text-lg font-black text-slate-100">{context.location}</h3>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePlayerDone}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl border-b-4 border-indigo-900 active:scale-95 transition-all"
            >
              I'M DONE SPEAKING
            </button>
            
            <button
              onClick={() => {
                if (soundEnabled) soundService.playClick();
                onTimerEnd();
              }}
              className="w-full py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold active:scale-95"
            >
              {isVirusMode ? 'END ROUND' : 'SKIP TO VOTING'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meeting;