
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, GameMode, MainMode, GroupMode, ScenarioSet, InquestSet, WordSet, RoleDistributionMode, CustomRoleConfig, GameCategory, VirusSet } from '../types';
import { MIN_PLAYERS, MAX_PLAYERS } from '../constants';
import { soundService } from '../services/soundService';

// Fix: Add missing SetupProps interface definition
interface SetupProps {
  playerCount: number;
  setPlayerCount: (n: number) => void;
  gameCategory: GameCategory;
  setGameCategory: (c: GameCategory) => void;
  groupMode: GroupMode;
  setGroupMode: (m: GroupMode) => void;
  mainMode: MainMode;
  setMainMode: (m: MainMode) => void;
  customRoleConfig: CustomRoleConfig;
  setCustomRoleConfig: (c: CustomRoleConfig) => void;
  soundEnabled: boolean;
  hasMrWhite: boolean;
  setHasMrWhite: (b: boolean) => void;
  hasMimic: boolean;
  setHasMimic: (b: boolean) => void;
  hasBountyHunter: boolean;
  setHasBountyHunter: (b: boolean) => void;
  hasOracle: boolean;
  setHasOracle: (b: boolean) => void;
  hasAnarchist: boolean;
  setHasAnarchist: (b: boolean) => void;
  gameMode: GameMode;
  setGameMode: (m: GameMode) => void;
  includeTaboo: boolean;
  setIncludeTaboo: (b: boolean) => void;
  wordSets: WordSet[];
  activeWordSetIds: string[];
  setActiveWordSetIds: (ids: string[]) => void;
  scenarioSets: ScenarioSet[];
  activeSetIds: string[];
  setActiveSetIds: (ids: string[]) => void;
  inquestSets: InquestSet[];
  activeInquestSetIds: string[];
  setActiveInquestSetIds: (ids: string[]) => void;
  onStart: () => void;
}

// Fix: Cast motion to any to avoid property missing errors in JSX in this environment
const M = motion as any;

const FORBIDDEN_NAMES = ['neighbor', 'imposter', 'mr. white', 'mr white', 'anarchist', 'mimic', 'the mimic', 'oracle', 'the oracle', 'bounty hunter'];

const Setup: React.FC<SetupProps> = (props) => {
  const [showExtraRoles, setShowExtraRoles] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");
  const [nameErrors, setNameErrors] = useState<Record<number, string>>({});

  const maxPossibleImposters = Math.floor(props.playerCount / 2);

  const handleCustomAdjust = (field: keyof CustomRoleConfig, delta: number) => {
    if (props.soundEnabled) soundService.playClick();
    const current = props.customRoleConfig;
    let newValue = (current[field] as number) + delta;
    if (field === 'imposterCount') newValue = Math.max(1, Math.min(newValue, maxPossibleImposters));
    if (field === 'specialCount') newValue = Math.max(0, Math.min(newValue, props.playerCount - current.imposterCount - 1));
    const newNeighbor = props.playerCount - (field === 'imposterCount' ? newValue : current.imposterCount) - (field === 'specialCount' ? newValue : current.specialCount);
    props.setCustomRoleConfig({ ...current, [field]: newValue, neighborCount: Math.max(0, newNeighbor) });
  };

  const toggleSet = (id: string) => {
    if (props.soundEnabled) soundService.playClick();
    if (props.mainMode === MainMode.TERMS || props.mainMode === MainMode.PAIR || props.mainMode === MainMode.VIRUS_PURGE) {
      const next = props.activeWordSetIds.includes(id) ? props.activeWordSetIds.filter(x => x !== id) : [...props.activeWordSetIds, id];
      if (next.length > 0) props.setActiveWordSetIds(next);
    } else {
      const ids = (props.mainMode === MainMode.SCHEME || props.mainMode === MainMode.INVESTMENT) ? props.activeSetIds : props.activeInquestSetIds;
      const setter = (props.mainMode === MainMode.SCHEME || props.mainMode === MainMode.INVESTMENT) ? props.setActiveSetIds : props.setActiveInquestSetIds;
      const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
      if (next.length > 0) setter(next);
    }
  };

  const selectAllSets = () => {
    if (props.soundEnabled) soundService.playClick();
    if (props.mainMode === MainMode.TERMS || props.mainMode === MainMode.PAIR || props.mainMode === MainMode.VIRUS_PURGE) props.setActiveWordSetIds(props.wordSets.map(s => s.id));
    else if (props.mainMode === MainMode.SCHEME || props.mainMode === MainMode.INVESTMENT) props.setActiveSetIds(props.scenarioSets.map(s => s.id));
    else props.setActiveInquestSetIds(props.inquestSets.map(s => s.id));
  };

  const validateName = (name: string): string => {
    const trimmed = name.trim();
    if (trimmed === "") return "Please input a proper name";
    if (trimmed.length > 14) return "Too long (max 14)";
    if (FORBIDDEN_NAMES.includes(trimmed.toLowerCase())) return "Identifier reserved";
    return "";
  };

  const handleExecuteMission = () => {
    props.onStart();
  };

  const currentSets = (props.mainMode === MainMode.TERMS || props.mainMode === MainMode.PAIR || props.mainMode === MainMode.VIRUS_PURGE) ? props.wordSets : (props.mainMode === MainMode.SCHEME || props.mainMode === MainMode.INVESTMENT ? props.scenarioSets : props.inquestSets);
  const currentActiveIds = (props.mainMode === MainMode.TERMS || props.mainMode === MainMode.PAIR || props.mainMode === MainMode.VIRUS_PURGE) ? props.activeWordSetIds : (props.mainMode === MainMode.SCHEME || props.mainMode === MainMode.INVESTMENT ? props.activeSetIds : props.activeInquestSetIds);

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="text-center shrink-0">
        <h2 className="text-3xl font-black text-indigo-400 uppercase tracking-tighter">Mission Briefing</h2>
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">{props.gameCategory}</p>
      </div>

      <div className="space-y-5 overflow-y-auto pr-1 custom-scrollbar pb-6 flex-1">
        <div className="space-y-3 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-center">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Active Operatives</label>
            <div className="flex items-center justify-center gap-6">
                <button onClick={() => { if (props.playerCount > MIN_PLAYERS) props.setPlayerCount(props.playerCount - 1); }} className="w-12 h-12 rounded-2xl bg-slate-800 border-b-4 border-slate-950 text-white font-black text-2xl flex items-center justify-center active:translate-y-1 transition-all">-</button>
                <div className="text-center"><span className="text-5xl font-black text-indigo-400 tabular-nums">{props.playerCount}</span></div>
                <button onClick={() => { if (props.playerCount < MAX_PLAYERS) props.setPlayerCount(props.playerCount + 1); }} className="w-12 h-12 rounded-2xl bg-indigo-600 border-b-4 border-indigo-900 text-white font-black text-2xl flex items-center justify-center active:translate-y-1 transition-all">+</button>
            </div>
        </div>

        {props.gameCategory === GameCategory.PVP && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 px-1">Class</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-800/50 p-1 rounded-xl">
                  {[GroupMode.CLASSIC, GroupMode.ADVANCED].map(g => (
                    <button key={g} onClick={() => props.setGroupMode(g)} className={`py-2 rounded-lg font-black text-[9px] uppercase transition-all ${props.groupMode === g ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`} >{g}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 px-1">Mode</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-800/50 p-1 rounded-xl">
                  {props.groupMode === GroupMode.CLASSIC ? [MainMode.TERMS, MainMode.SCHEME, MainMode.INQUEST].map(m => (
                      <button key={m} onClick={() => props.setMainMode(m)} className={`py-2 rounded-lg font-black text-[8px] uppercase transition-all ${props.mainMode === m ? 'bg-indigo-600 text-white' : 'text-slate-500'}`} >{m}</button>
                    )) : [MainMode.INVESTMENT, MainMode.PAIR].map(m => (
                      <button key={m} onClick={() => props.setMainMode(m)} className={`py-2 rounded-lg font-black text-[8px] uppercase transition-all ${props.mainMode === m ? 'bg-indigo-600 text-white' : 'text-slate-500'}`} >{m}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => setShowExtraRoles(!showExtraRoles)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${showExtraRoles ? 'border-indigo-500 bg-indigo-900/20' : 'border-slate-800 bg-slate-800/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg"><svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
                    <div className="text-left"><div className="font-black text-xs uppercase tracking-wider text-slate-100">Special Operatives</div><div className="text-[8px] text-slate-500 font-bold uppercase">Toggle Personnel</div></div>
                  </div>
                  <div className={`transition-transform ${showExtraRoles ? 'rotate-180' : ''}`}>▼</div>
              </button>
              <AnimatePresence>
                {showExtraRoles && (
                  // Fix: Using M.div instead of motion.div to bypass environment-specific type errors
                  <M.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-1 p-2 bg-slate-900/50 rounded-2xl border border-slate-800">
                    {[
                      { r: Role.MR_WHITE, state: props.hasMrWhite, toggle: () => props.setHasMrWhite(!props.hasMrWhite), team: 'Imposter' },
                      { r: Role.MIMIC, state: props.hasMimic, toggle: () => props.setHasMimic(!props.hasMimic), team: 'Imposter' },
                      { r: Role.BOUNTY_HUNTER, state: props.hasBountyHunter, toggle: () => props.setHasBountyHunter(!props.hasBountyHunter), team: 'Neighbor' },
                      { r: Role.ORACLE, state: props.hasOracle, toggle: () => props.setHasOracle(!props.hasOracle), team: 'Neighbor' },
                      { r: Role.ANARCHIST, state: props.hasAnarchist, toggle: () => props.setHasAnarchist(!props.hasAnarchist), team: 'Rogue' },
                    ].map(item => (
                      <button key={item.r} onClick={item.toggle} className={`w-full p-2.5 rounded-xl border-2 flex justify-between items-center transition-all ${item.state ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800'}`}>
                         <div className="flex flex-col text-left">
                           <span className={`text-[10px] font-black uppercase ${item.state ? 'text-white' : 'text-slate-600'}`}>{item.r}</span>
                           <span className="text-[7px] font-black uppercase text-slate-500">{item.team} Team</span>
                         </div>
                         <div className={`w-3.5 h-3.5 rounded-full border-2 ${item.state ? 'bg-indigo-500 border-indigo-300' : 'border-slate-700'}`} />
                      </button>
                    ))}
                  </M.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 px-1">Game Protocol</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => props.setGameMode(props.gameMode === GameMode.MYSTERIOUS ? GameMode.NORMAL : GameMode.MYSTERIOUS)} className={`p-4 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${props.gameMode === GameMode.MYSTERIOUS ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>Mysterious</button>
                    <button onClick={() => props.setIncludeTaboo(!props.includeTaboo)} className={`p-4 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${props.includeTaboo ? 'border-purple-500 bg-purple-600 text-white shadow-lg' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>Taboo Mode</button>
                </div>
            </div>
          </>
        )}

        <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase text-slate-500">Mission Content</label>
              <button onClick={selectAllSets} className="text-[9px] font-black text-indigo-500 uppercase">All</button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                {currentSets.map(set => (
                <button key={set.id} onClick={() => toggleSet(set.id)} className={`px-3 py-2 rounded-xl text-[10px] font-bold text-left border ${currentActiveIds.includes(set.id) ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`} > {set.name} </button>
                ))}
            </div>
        </div>
      </div>
      <button onClick={handleExecuteMission} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-xl shadow-xl border-b-4 border-indigo-900 active:scale-95 transition-all mt-4" > EXECUTE MISSION </button>
    </div>
  );
};

export default Setup;
