
import React, { useState, useMemo } from 'react';
import { Player, Role, MainMode } from '../types';
import { soundService } from '../services/soundService';

interface MimicGuessProps {
  player: Player;
  allPlayers: Player[];
  imposters: Player[];
  realProject: string;
  distractors: string[];
  mainMode: MainMode;
  onResult: (correct: boolean) => void;
  soundEnabled: boolean;
}

const MimicGuess: React.FC<MimicGuessProps> = ({ player, allPlayers, imposters, realProject, distractors, mainMode, onResult, soundEnabled }) => {
  const [selectedImposterId, setSelectedImposterId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  
  const projectOptions = useMemo(() => {
    return [realProject, ...distractors].sort(() => Math.random() - 0.5);
  }, [realProject, distractors]);

  const candidates = useMemo(() => {
    return allPlayers.filter(p => p.id !== player.id);
  }, [allPlayers, player.id]);

  const isTextInputMode = mainMode === MainMode.TERMS || mainMode === MainMode.PAIR;

  const handleFinalSubmit = () => {
    if (!selectedImposterId) return;
    const finalWordGuess = isTextInputMode ? textInput : selectedProject;
    if (!finalWordGuess) return;

    if (soundEnabled) soundService.playLockIn();
    const isImposterCorrect = imposters.some(imp => imp.id === selectedImposterId);
    const isProjectCorrect = finalWordGuess.toLowerCase().trim() === realProject.toLowerCase().trim();
    onResult(isImposterCorrect && isProjectCorrect);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in scale-in duration-500">
      <div className="text-center space-y-2">
        <div className="inline-block px-3 py-1 bg-teal-600 text-white text-[10px] font-black uppercase rounded-full mb-2 tracking-widest">Mimicking Signal...</div>
        <h2 className="text-3xl font-black text-slate-100">THE MIMIC'S TURN</h2>
        <p className="text-slate-400 text-xs">A civilian win is pending. Can you mimic the truth and steal the win?</p>
      </div>

      <div className="bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50 grid grid-cols-2 gap-2">
          <div className={`py-2 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${step === 1 ? 'bg-teal-600 text-white' : 'text-slate-500'}`}>1. Target Imposter</div>
          <div className={`py-2 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${step === 2 ? 'bg-teal-600 text-white' : 'text-slate-500'}`}>2. Identify Word</div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {step === 1 ? (
          <div className="grid grid-cols-1 gap-2">
            {candidates.map(p => (
              <button 
                key={p.id}
                onClick={() => {
                  if (soundEnabled) soundService.playClick();
                  setSelectedImposterId(p.id);
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedImposterId === p.id ? 'border-teal-500 bg-teal-500/10' : 'border-slate-800 bg-slate-800'}`}
              >
                <span className="font-bold">{p.name}</span>
              </button>
            ))}
          </div>
        ) : (
          isTextInputMode ? (
            <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
              <input 
                autoFocus
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full bg-slate-900 border-2 border-teal-500/30 p-5 rounded-3xl text-center font-black text-xl uppercase text-teal-400 focus:border-teal-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="TYPE MIMICKED WORD..."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {projectOptions.map(opt => (
                <button 
                  key={opt}
                  onClick={() => {
                    if (soundEnabled) soundService.playClick();
                    setSelectedProject(opt);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedProject === opt ? 'border-teal-500 bg-teal-500/10' : 'border-slate-800 bg-slate-800'}`}
                >
                  <span className="font-bold">{opt}</span>
                </button>
              ))}
            </div>
          )
        )}
      </div>

      <div className="flex gap-4">
        {step === 2 && (
            <button 
                onClick={() => {
                   if (soundEnabled) soundService.playClick();
                   setStep(1);
                }}
                className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest"
            >Back</button>
        )}
        <button 
            disabled={step === 1 ? !selectedImposterId : (isTextInputMode ? !textInput.trim() : !selectedProject)}
            onClick={() => {
               if (soundEnabled) soundService.playClick();
               step === 1 ? setStep(2) : handleFinalSubmit();
            }}
            className="flex-[2] py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl disabled:opacity-30"
        >
            {step === 1 ? 'Next Step' : 'Confirm ID'}
        </button>
      </div>
    </div>
  );
};

export default MimicGuess;
