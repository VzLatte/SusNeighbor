
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Player, Role, GameContext, GameMode, MainMode } from '../types';
import { soundService } from '../services/soundService';

// Fix: Add missing RevealCardProps interface definition
interface RevealCardProps {
  player: Player;
  gameMode: GameMode;
  mainMode: MainMode;
  soundEnabled: boolean;
  slotMachineEnabled: boolean;
  activeRoles: Role[];
  context: GameContext;
  onNext: () => void;
}

// Fix: Cast motion to any to avoid property missing errors in JSX in this environment
const M = motion as any;

const SlotMachine: React.FC<{ targetRole: Role, activeRoles: Role[], onFinish: () => void, soundEnabled: boolean }> = ({ targetRole, activeRoles, onFinish, soundEnabled }) => {
  const [displayRole, setDisplayRole] = useState(activeRoles[0] || Role.NEIGHBOR);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let count = 0;
    const totalSteps = 25;
    const baseSpeed = 50;

    const tick = () => {
      if (count >= totalSteps) {
        setDisplayRole(targetRole);
        setIsDone(true);
        if (soundEnabled) soundService.playLockIn();
        setTimeout(onFinish, 800);
        return;
      }
      const nextRole = activeRoles[Math.floor(Math.random() * activeRoles.length)];
      setDisplayRole(nextRole);
      if (soundEnabled) soundService.playTick();
      count++;
      const nextDelay = baseSpeed + (Math.pow(count / totalSteps, 3) * 300);
      setTimeout(tick, nextDelay);
    };
    tick();
  }, [targetRole, activeRoles, soundEnabled, onFinish]);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="relative w-full h-32 flex items-center justify-center overflow-hidden bg-slate-950 rounded-2xl border-2 border-indigo-500/50 shadow-[inset_0_0_20px_rgba(79,70,229,0.3)]">
        <M.div key={displayRole} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className={`text-3xl font-black uppercase tracking-tighter ${isDone ? 'text-indigo-400 scale-110 shadow-indigo-500/20' : 'text-slate-600'}`} style={{ textShadow: isDone ? '0 0 15px rgba(129, 140, 248, 0.6)' : 'none' }}>
          {displayRole}
        </M.div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-black/20" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/50 animate-pulse">
        {isDone ? 'IDENTITY CONFIRMED' : 'DECRYPTING NEURAL LINK...'}
      </p>
    </div>
  );
};

const RevealCard: React.FC<RevealCardProps> = ({ player, gameMode, mainMode, soundEnabled, slotMachineEnabled, activeRoles, onNext, context }) => {
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const y = useMotionValue(0);
  const peekY = useTransform(y, [0, -400], [0, -400], { clamp: true });
  const opacity = useTransform(y, [0, -100], [1, 0.8]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.y < -100 && !hasRevealed) {
      setHasRevealed(true);
      if (soundEnabled) soundService.playReveal();
      if (slotMachineEnabled) { setIsSpinning(true); } else { setShowContent(true); }
    }
  };

  const isActuallyNeighbor = (gameMode === GameMode.MYSTERIOUS && player.role === Role.IMPOSTER);
  const displayedRole = isActuallyNeighbor ? Role.NEIGHBOR : player.role;

  const getRoleTheme = () => {
    switch(displayedRole) {
      case Role.IMPOSTER: return { color: 'pink', text: 'text-pink-500', desc: "Infiltrate the group. Your project is a decoy. Blend in." };
      case Role.MR_WHITE: return { color: 'yellow', text: 'text-yellow-500', desc: "Total blackout. You have no intel. Fake it." };
      case Role.ANARCHIST: return { color: 'orange', text: 'text-orange-500', desc: "Chaos agent. Get yourself voted out to win." };
      case Role.MIMIC: return { color: 'teal', text: 'text-teal-500', desc: "Imposter Team. You know the REAL word. Help the Imposters." };
      case Role.BOUNTY_HUNTER: return { color: 'cyan', text: 'text-cyan-400', desc: "Neighbor Team. You know the word. Find the Imposter. Choose carefully." };
      case Role.ORACLE: return { color: 'purple', text: 'text-purple-400', desc: "Analyze the data below. Logic is your weapon." };
      default: return { color: 'indigo', text: 'text-indigo-400', desc: "Protect the secret project. Find the infiltrators." };
    }
  };

  const theme = getRoleTheme();
  const hasIntel = [Role.NEIGHBOR, Role.ANARCHIST, Role.BOUNTY_HUNTER, Role.MIMIC].includes(player.role);
  const showCategory = mainMode === MainMode.TERMS || mainMode === MainMode.PAIR || mainMode === MainMode.VIRUS_PURGE;

  const handleBriefingRead = () => {
    const settings = localStorage.getItem('imposter_settings');
    const requireConfirm = settings ? JSON.parse(settings).requireRememberConfirmation : true;
    if (requireConfirm) {
      setShowConfirmation(true);
    } else {
      onNext();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8 relative">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-indigo-500 tracking-tighter">{player.name}</h2>
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">Swipe Up to Peek</p>
      </div>

      <div className="w-full aspect-[3/4] max-w-[280px] relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900">
        <div className="absolute inset-0 p-6 flex flex-col pointer-events-none">
          {isSpinning ? (
            <SlotMachine targetRole={displayedRole} activeRoles={activeRoles} soundEnabled={soundEnabled} onFinish={() => { setIsSpinning(false); setShowContent(true); }} />
          ) : showContent ? (
            <M.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.text}`}>Clearance: {displayedRole.toUpperCase()}</span>
              <h3 className="text-3xl font-black mb-2 leading-none text-white">{displayedRole}</h3>
              <div className="space-y-4 flex-1">
                {showCategory && context.category && (
                  <div className="p-2 bg-indigo-950/40 rounded-xl border border-indigo-500/30 text-center">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Category</p>
                    <p className="text-xs font-black text-white">{context.category}</p>
                  </div>
                )}
                <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Directives</p>
                   <p className="text-[10px] leading-relaxed text-slate-300 font-bold">{theme.desc}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">{player.role === Role.ORACLE ? 'CRYPTIC INTEL' : 'Mission Intel'}</label>
                  {mainMode === MainMode.PAIR && hasIntel ? (
                    <div className="space-y-2">
                        <div className="text-xl font-black text-white leading-tight">Word 1: {player.assignedProject}</div>
                        <div className="text-xl font-black text-white leading-tight">Word 2: {player.assignedProject2}</div>
                    </div>
                  ) : (
                    <div className={`text-xl font-black ${ (player.role === Role.MR_WHITE) ? 'blur-lg bg-slate-800 rounded px-2' : 'text-white'}`}>
                        {player.role === Role.ORACLE ? (player.oracleInfo || "No Data") : player.assignedProject}
                    </div>
                  )}
                </div>
                {context.tabooConstraint && hasIntel && (
                  <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-2xl">
                     <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">TABOO CONSTRAINT</p>
                     <p className="text-[10px] text-purple-200 font-bold italic leading-tight">"{context.tabooConstraint}"</p>
                  </div>
                )}
                {![MainMode.TERMS, MainMode.PAIR, MainMode.VIRUS_PURGE].includes(mainMode) && player.role !== Role.ORACLE && player.role !== Role.MR_WHITE && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Operation Site</label>
                    <div className="text-lg font-black text-slate-100">{context.location}</div>
                  </div>
                )}
              </div>
            </M.div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Encrypted Content</p>
            </div>
          )}
        </div>
        <M.div drag="y" dragConstraints={{ top: -450, bottom: 0 }} style={{ y: peekY, opacity }} onDragEnd={handleDragEnd} className="absolute inset-0 z-10 bg-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-4 cursor-grab active:cursor-grabbing border-4 border-slate-700 rounded-[2.8rem]" whileTap={{ scale: 0.98 }}>
          <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
            <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </div>
          <p className="font-bold text-lg uppercase tracking-widest text-slate-400">Pull Up</p>
        </M.div>
      </div>

      <button disabled={!showContent} onClick={handleBriefingRead} className={`w-full py-5 rounded-3xl font-black text-xl transition-all ${ showContent ? 'bg-indigo-600 text-white shadow-xl active:scale-95 border-b-4 border-indigo-900' : 'bg-slate-800 text-slate-600'}`}>
        {showContent ? 'BRIEFING READ' : isSpinning ? 'DECRYPTING...' : 'SWIPE TO REVEAL'}
      </button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <M.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-8">
            <M.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 border-2 border-indigo-500/30 rounded-[2.5rem] p-8 w-full max-w-sm text-center shadow-2xl space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Memorization Lock</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Once you proceed, the phone must be passed. Have you internalized your secret word and mission objectives?</p>
              </div>
              <button 
                onClick={() => { if (soundEnabled) soundService.playLockIn(); onNext(); }} 
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-xl shadow-xl shadow-indigo-500/20 active:scale-95 border-b-4 border-indigo-900 transition-all"
              >
                I HAVE MEMORIZED MY WORD
              </button>
              <button onClick={() => setShowConfirmation(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300">Wait, show briefing again</button>
            </M.div>
          </M.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RevealCard;
