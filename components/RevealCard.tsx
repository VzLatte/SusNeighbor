import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Player, Role, GameContext, GameMode, MainMode } from '../types';
import { soundService } from '../services/soundService';

interface RevealCardProps {
  player: Player;
  gameMode: GameMode;
  mainMode: MainMode;
  soundEnabled: boolean;
  onNext: () => void;
  context: GameContext;
}

const RevealCard: React.FC<RevealCardProps> = ({ player, gameMode, mainMode, soundEnabled, onNext, context }) => {
  const [hasRevealedOnce, setHasRevealedOnce] = useState(false);
  
  const y = useMotionValue(0);
  const peekY = useTransform(y, [0, -400], [0, -400], { clamp: true });
  const opacity = useTransform(y, [0, -100], [1, 0.8]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.y < -100) {
      if (!hasRevealedOnce && soundEnabled) {
        soundService.playReveal();
      }
      setHasRevealedOnce(true);
    }
  };

  const isActuallyNeighbor = (gameMode === GameMode.MYSTERIOUS && player.role === Role.IMPOSTER);
  const displayedRole = isActuallyNeighbor ? Role.NEIGHBOR : player.role;

  const getRoleTheme = () => {
    switch(displayedRole) {
      case Role.IMPOSTER: return { color: 'pink', text: 'text-pink-500', desc: "Infiltrate the group. Your project is a decoy. Blend in and don't get caught." };
      case Role.MR_WHITE: return { color: 'yellow', text: 'text-yellow-500', desc: "Total blackout. You have no intel. Listen to the others and fake your mission." };
      case Role.ANARCHIST: return { color: 'orange', text: 'text-orange-500', desc: "Chaos is your goal. Act suspicious. You win if the group votes YOU out." };
      case Role.MIMIC: return { color: 'teal', text: 'text-teal-500', desc: "Double agent. You know nothing. Identify both the Imposter and the Project to win." };
      case Role.ORACLE: return { color: 'purple', text: 'text-purple-400', desc: "Strategic insight. You know the Imposter's identity. Don't be too obvious." };
      default: return { color: 'indigo', text: 'text-indigo-400', desc: "Protect the secret project. Find the infiltrators among you." };
    }
  };

  const theme = getRoleTheme();
  const hasIntel = [Role.NEIGHBOR, Role.ANARCHIST].includes(player.role);

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-indigo-500 tracking-tighter">{player.name}</h2>
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">Swipe Up to Peek</p>
      </div>

      <div className="w-full aspect-[3/4] max-w-[280px] relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900">
        
        <div className="absolute inset-0 p-6 flex flex-col pointer-events-none">
          <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.text}`}>
            Clearance: {displayedRole.toUpperCase()}
          </span>
          <h3 className="text-3xl font-black mb-2 leading-none text-white">{displayedRole}</h3>
          
          <div className="space-y-4 flex-1">
            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Directives</p>
               <p className="text-[10px] leading-relaxed text-slate-300 font-bold">{theme.desc}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                {player.role === Role.ORACLE ? 'TARGET IDENTIFIED' : 'Mission Intel'}
              </label>
              
              {mainMode === MainMode.PAIR && hasIntel ? (
                <div className="space-y-2">
                    <div className="text-xl font-black text-white leading-tight">Word 1: {player.assignedProject}</div>
                    <div className="text-xl font-black text-white leading-tight">Word 2: {player.assignedProject2}</div>
                </div>
              ) : (
                <div className={`text-2xl font-black ${ (player.role === Role.MR_WHITE || player.role === Role.MIMIC) ? 'blur-lg bg-slate-800 rounded px-2' : 'text-white'}`}>
                    {player.role === Role.ORACLE ? player.oracleTargetName : player.assignedProject}
                </div>
              )}
            </div>

            {context.tabooConstraint && hasIntel && (
              <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-2xl">
                 <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">TABOO CONSTRAINT</p>
                 <p className="text-[10px] text-purple-200 font-bold italic leading-tight">"{context.tabooConstraint}"</p>
              </div>
            )}

            {![MainMode.TERMS, MainMode.PAIR].includes(mainMode) && player.role !== Role.ORACLE && player.role !== Role.MR_WHITE && player.role !== Role.MIMIC && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Operation Site</label>
                <div className="text-lg font-black text-slate-100">{context.location}</div>
              </div>
            )}
          </div>
        </div>

        <motion.div
          drag="y"
          dragConstraints={{ top: -450, bottom: 0 }}
          style={{ y: peekY, opacity }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 z-10 bg-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-4 cursor-grab active:cursor-grabbing border-4 border-slate-700 rounded-[2.8rem]"
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
            <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
          <p className="font-bold text-lg uppercase tracking-widest text-slate-400">Pull Up</p>
        </motion.div>
      </div>

      <button 
        disabled={!hasRevealedOnce}
        onClick={onNext}
        className={`w-full py-5 rounded-3xl font-black text-xl transition-all ${
          hasRevealedOnce 
            ? 'bg-indigo-600 text-white shadow-xl active:scale-95 border-b-4 border-indigo-900' 
            : 'bg-slate-800 text-slate-600'
        }`}
      >
        BRIEFING READ
      </button>
    </div>
  );
};

export default RevealCard;