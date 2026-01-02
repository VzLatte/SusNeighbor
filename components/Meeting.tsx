import React, { useState, useEffect } from 'react';
import { GameContext, MainMode } from '../types';
import { soundService } from '../services/soundService';

interface MeetingProps {
  context: GameContext;
  onTimerEnd: () => void;
  duration: number;
  soundEnabled: boolean;
  virusPoints?: number;
  onDetection?: () => void;
}

const Meeting: React.FC<MeetingProps> = ({ context, onTimerEnd, duration, soundEnabled, virusPoints = 0, onDetection }) => {
  const [seconds, setSeconds] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (seconds <= 0) {
      onTimerEnd();
      return;
    }
    if (isPaused) return;

    if (soundEnabled && seconds <= 10 && seconds > 0) soundService.playTick();

    const timer = setInterval(() => setSeconds(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds, isPaused, onTimerEnd, soundEnabled]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isVirusMode = context.mainMode === MainMode.VIRUS_PURGE;

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-black mb-1">{isVirusMode ? 'Signal Description' : 'Town Meeting'}</h2>
        <div className="inline-flex items-center gap-2 bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-500/30">
           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Lead Speaker:</span>
           <span className="text-xs font-black text-indigo-100">{context.startingPlayerName}</span>
        </div>
      </div>

      {isVirusMode && (
        <div className="flex gap-2 justify-center">
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${virusPoints >= i ? 'bg-pink-600 border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'bg-slate-800 border-slate-700'}`}>
              <span className="text-[10px] font-black text-white">{virusPoints >= i ? '!' : i}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div 
          onClick={() => { if (soundEnabled) soundService.playClick(); setIsPaused(!isPaused); }}
          className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-8 transition-all cursor-pointer ${
            seconds < 30 ? 'border-red-500 animate-pulse text-red-500' : (isVirusMode ? 'border-teal-500 text-teal-500' : 'border-indigo-500 text-indigo-500')
          }`}
        >
          <span className="text-5xl font-black">{formatTime(seconds)}</span>
          <span className="text-[10px] uppercase font-bold tracking-widest mt-2">{isPaused ? 'Paused' : 'Remaining'}</span>
        </div>

        {isVirusMode && (
          <div className="w-full space-y-3 animate-in fade-in duration-500 delay-300">
            <h4 className="text-[10px] font-black uppercase text-slate-500 text-center tracking-widest">⚠️ Detection Noise (Avoid These Words)</h4>
            <div className="grid grid-cols-3 gap-2">
               {context.noiseWords?.map(w => (
                 <div key={w} className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{w}</span>
                 </div>
               ))}
            </div>
            <button onClick={onDetection} className="w-full py-3 bg-pink-900/20 border border-pink-500/30 rounded-2xl text-pink-500 text-[10px] font-black uppercase tracking-widest active:scale-95" >
              🚨 Report Detection / Slip-Up
            </button>
          </div>
        )}

        {!isVirusMode && (
          <div className="w-full p-5 bg-slate-800 rounded-3xl border border-slate-700 text-center">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Operation Intel</span>
            <h3 className="text-xl font-black text-slate-100">{context.location}</h3>
          </div>
        )}
      </div>

      <button onClick={onTimerEnd} className="w-full py-4 bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl font-bold" >
        {isVirusMode ? 'COMPLETE ROUND' : 'SKIP TO VOTING'}
      </button>
    </div>
  );
};

export default Meeting;