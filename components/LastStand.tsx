
import React, { useState, useEffect } from 'react';
import { Player, Role, MainMode } from '../types';
import { soundService } from '../services/soundService';

interface LastStandProps {
  player: Player;
  allPlayers: Player[];
  realProject: string;
  distractors: string[];
  mainMode: MainMode;
  onResult: (result: 'PROJECT_CORRECT' | 'PROJECT_WRONG' | 'ORACLE_CORRECT' | 'ORACLE_WRONG') => void;
  duration: number;
  soundEnabled: boolean;
  hasOracleInPlay: boolean;
}

const LastStand: React.FC<LastStandProps> = ({ player, allPlayers, realProject, distractors, mainMode, onResult, duration, soundEnabled, hasOracleInPlay }) => {
  const isImposter = player.role === Role.IMPOSTER;
  const isMrWhite = player.role === Role.MR_WHITE;
  const isBountyHunter = player.role === Role.BOUNTY_HUNTER;
  
  // Bounty Hunter defaults to PROJECT mode to prove innocence (or redemption)
  const initialMode = (isImposter) ? 'ORACLE' : (hasOracleInPlay && !isBountyHunter ? 'SELECT' : 'PROJECT');
  
  const [guessMode, setGuessMode] = useState<'PROJECT' | 'ORACLE' | 'SELECT'>(initialMode);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [seconds, setSeconds] = useState(duration);
  const [textInput, setTextInput] = useState("");
  
  const [projectOptions] = useState(() => {
    return [realProject, ...distractors].sort(() => Math.random() - 0.5);
  });

  const isTextInputMode = mainMode === MainMode.TERMS || mainMode === MainMode.PAIR;

  const oracleCandidates = allPlayers.filter(p => p.id !== player.id);

  useEffect(() => {
    if (hasGuessed || guessMode === 'SELECT') return;
    
    if (seconds <= 0) {
      onResult(guessMode === 'PROJECT' ? 'PROJECT_WRONG' : 'ORACLE_WRONG');
      return;
    }

    if (soundEnabled && seconds <= 5 && seconds > 0) {
      soundService.playTick();
    }

    const timer = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, hasGuessed, onResult, soundEnabled, guessMode]);

  const handleProjectGuess = (option: string) => {
    if (hasGuessed) return;
    if (soundEnabled) soundService.playClick();
    setHasGuessed(true);
    onResult(option.toLowerCase().trim() === realProject.toLowerCase().trim() ? 'PROJECT_CORRECT' : 'PROJECT_WRONG');
  };

  const handleOracleGuess = (target: Player) => {
    if (hasGuessed) return;
    if (soundEnabled) soundService.playClick();
    setHasGuessed(true);
    onResult(target.role === Role.ORACLE ? 'ORACLE_CORRECT' : 'ORACLE_WRONG');
  };

  const getFlavorText = () => {
    if (isBountyHunter) return "Prove your identity to save the mission.";
    if (isImposter) return "Locate the Oracle to salvage the operation.";
    return "Identify the target Asset to compromise the mission.";
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in scale-in duration-500">
      <div className="text-center space-y-2">
        <div className="inline-block px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase rounded-full mb-2 tracking-widest">Caught!</div>
        <h2 className="text-3xl font-black text-slate-100">{player.role}'s Last Stand</h2>
        <p className="text-slate-400 text-sm">
          {getFlavorText()}
        </p>
      </div>

      {guessMode !== 'SELECT' && (
        <div className="flex justify-center">
          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-black text-2xl ${
            seconds <= 3 ? 'border-red-500 text-red-500 animate-pulse' : 'border-indigo-500 text-indigo-500'
          }`}>
            {seconds}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center space-y-4">
        {guessMode === 'SELECT' && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <button 
               onClick={() => setGuessMode('PROJECT')}
               className="w-full p-8 bg-indigo-600 rounded-3xl text-white font-black text-xl shadow-xl shadow-indigo-500/20 active:scale-95"
             >
                INTERCEPT DATA (GUESS PROJECT)
             </button>
             <button 
               onClick={() => setGuessMode('ORACLE')}
               className="w-full p-8 bg-slate-800 border-2 border-slate-700 rounded-3xl text-indigo-400 font-black text-xl active:scale-95"
             >
                EXPOSE THE ORACLE
             </button>
          </div>
        )}

        {guessMode === 'PROJECT' && (
          isTextInputMode ? (
            <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
              <input 
                autoFocus
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleProjectGuess(textInput); }}
                className="w-full bg-slate-900 border-2 border-indigo-500/30 p-5 rounded-3xl text-center font-black text-xl uppercase text-indigo-400 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="TYPE SECRET PROJECT..."
              />
              <button 
                onClick={() => handleProjectGuess(textInput)}
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl active:scale-95 border-b-4 border-indigo-900"
              >
                SUBMIT DECODED INTEL
              </button>
            </div>
          ) : (
            projectOptions.map((option, idx) => (
              <button
                key={idx}
                disabled={hasGuessed}
                onClick={() => handleProjectGuess(option)}
                className={`w-full p-5 bg-slate-800 border-2 border-slate-700 rounded-2xl text-left font-bold text-lg transition-all active:scale-[0.98] ${
                  !hasGuessed ? 'hover:border-indigo-500' : 'opacity-50'
                }`}
              >
                {option}
              </button>
            ))
          )
        )}

        {guessMode === 'ORACLE' && (
          <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
            {oracleCandidates.map(p => (
              <button 
                key={p.id}
                disabled={hasGuessed}
                onClick={() => handleOracleGuess(p)}
                className={`p-4 bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-sm text-left transition-all ${!hasGuessed ? 'hover:border-red-500 active:scale-95' : 'opacity-50'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {guessMode !== 'SELECT' && isMrWhite && hasOracleInPlay && (
        <button 
          onClick={() => {
            setGuessMode('SELECT');
            setTextInput("");
          }}
          className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
        >
          Switch Strategy
        </button>
      )}

      <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
        {guessMode === 'ORACLE' ? 'Expose the spy or fail' : 'Guess the word or fail'}
      </p>
    </div>
  );
};

export default LastStand;
