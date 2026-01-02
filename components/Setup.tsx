
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, GameMode, MainMode, GroupMode, ScenarioSet, InquestSet, WordSet, RoleDistributionMode, CustomRoleConfig, GameCategory, VirusSet } from '../types';
import { MIN_PLAYERS, MAX_PLAYERS } from '../constants';
import { soundService } from '../services/soundService';

interface SetupProps {
  gameCategory: GameCategory;
  playerCount: number;
  setPlayerCount: (n: number) => void;
  playerNames: string[];
  setPlayerNames: (names: string[]) => void;
  imposterCount: number;
  setImposterCount: (n: number) => void;
  hasMrWhite: boolean;
  setHasMrWhite: (b: boolean) => void;
  hasAnarchist: boolean;
  setHasAnarchist: (b: boolean) => void;
  hasMimic: boolean;
  setHasMimic: (b: boolean) => void;
  hasOracle: boolean;
  setHasOracle: (b: boolean) => void;
  includeHints: boolean;
  setIncludeHints: (b: boolean) => void;
  includeTaboo: boolean;
  setIncludeTaboo: (b: boolean) => void;
  isAuctionActive: boolean;
  setIsAuctionActive: (b: boolean) => void;
  isBlindBidding: boolean;
  setIsBlindBidding: (b: boolean) => void;
  gameMode: GameMode;
  setGameMode: (m: GameMode) => void;
  groupMode: GroupMode;
  setGroupMode: (g: GroupMode) => void;
  mainMode: MainMode;
  setMainMode: (m: MainMode) => void;
  roleDistributionMode: RoleDistributionMode;
  setRoleDistributionMode: (m: RoleDistributionMode) => void;
  customRoleConfig: CustomRoleConfig;
  setCustomRoleConfig: (c: CustomRoleConfig) => void;
  onStart: () => void;
  scenarioSets: ScenarioSet[];
  activeSetIds: string[];
  setActiveSetIds: (ids: string[]) => void;
  wordSets: WordSet[];
  activeWordSetIds: string[];
  setActiveWordSetIds: (ids: string[]) => void;
  inquestSets: InquestSet[];
  activeInquestSetIds: string[];
  setActiveInquestSetIds: (ids: string[]) => void;
  virusSets: VirusSet[];
  activeVirusSetIds: string[];
  setActiveVirusSetIds: (ids: string[]) => void;
  soundEnabled: boolean;
  useAiMissions: boolean;
  setUseAiMissions: (b: boolean) => void;
}

const FORBIDDEN_NAMES = [
  'neighbor', 'imposter', 'mr. white', 'mr white', 'anarchist', 'mimic', 'the mimic', 'oracle', 'the oracle'
];

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
    
    props.setCustomRoleConfig({ 
      ...current, 
      [field]: newValue, 
      neighborCount: Math.max(0, newNeighbor) 
    });
  };

  const handleSurpriseAdjust = (field: keyof CustomRoleConfig, delta: number) => {
    if (props.soundEnabled) soundService.playClick();
    const current = props.customRoleConfig;
    let newValue = (current[field] as number) + delta;

    if (field.includes('Imposters')) {
      newValue = Math.max(1, Math.min(newValue, maxPossibleImposters));
      if (field === 'minImposters' && newValue > current.maxImposters) newValue = current.maxImposters;
      if (field === 'maxImposters' && newValue < current.minImposters) newValue = current.minImposters;
    }
    if (field.includes('Specials')) {
      newValue = Math.max(0, Math.min(newValue, props.playerCount - 2));
      if (field === 'minSpecials' && newValue > current.maxSpecials) newValue = current.maxSpecials;
      if (field === 'maxSpecials' && newValue < current.minSpecials) newValue = current.minSpecials;
    }

    props.setCustomRoleConfig({ ...current, [field]: newValue });
  };

  const toggleSet = (id: string) => {
    if (props.soundEnabled) soundService.playClick();
    if (props.mainMode === MainMode.TERMS || props.mainMode === MainMode.PAIR || props.mainMode === MainMode.VIRUS_PURGE) {
      const next = props.activeWordSetIds.includes(id) ? props.activeWordSetIds.filter(x => x !== id) : [...props.activeWordSetIds, id];
      if (next.length > 0) props.setActiveWordSetIds(next);
    } else if (props.mainMode === MainMode.SCHEME || props.mainMode === MainMode.INVESTMENT) {
      const next = props.activeSetIds.includes(id) ? props.activeSetIds.filter(x => x !== id) : [...props.activeSetIds, id];
      if (next.length > 0) props.setActiveSetIds(next);
    } else {
      const next = props.activeInquestSetIds.includes(id) ? props.activeInquestSetIds.filter(x => x !== id) : [...props.activeInquestSetIds, id];
      if (next.length > 0) props.setActiveInquestSetIds(next);
    }
  };

  const selectAllSets = () => {
    if (props.soundEnabled) soundService.playClick();
    if (props.mainMode === MainMode.TERMS || props.mainMode === MainMode.PAIR || props.mainMode === MainMode.VIRUS_PURGE) {
      props.setActiveWordSetIds(props.wordSets.map(s => s.id));
    } else if (props.mainMode === MainMode.SCHEME || props.mainMode === MainMode.INVESTMENT) {
      props.setActiveSetIds(props.scenarioSets.map(s => s.id));
    } else {
      props.setActiveInquestSetIds(props.inquestSets.map(s => s.id));
    }
  };

  const validateName = (name: string): string => {
    const trimmed = name.trim();
    if (trimmed === "") return "Please input a proper name";
    if (trimmed.length > 14) return "Too long (max 14)";
    if (/[^a-zA-Z0-9 \-_]/.test(trimmed)) return "Letters/Numbers only";
    if (FORBIDDEN_NAMES.includes(trimmed.toLowerCase())) return "Identifier reserved";
    return "";
  };

  const startEditing = (idx: number) => {
    if (props.soundEnabled) soundService.playClick();
    setEditingIdx(idx);
    setTempName(props.playerNames[idx]);
    setNameErrors(prev => ({ ...prev, [idx]: "" }));
  };

  const cancelEditing = () => {
    if (props.soundEnabled) soundService.playClick();
    setEditingIdx(null);
    setTempName("");
  };

  const saveName = (idx: number) => {
    const error = validateName(tempName);
    if (error) {
      setNameErrors(prev => ({ ...prev, [idx]: error }));
      if (props.soundEnabled) soundService.playError();
      return;
    }

    if (props.soundEnabled) soundService.playLockIn();
    const newNames = [...props.playerNames];
    newNames[idx] = tempName.trim();
    props.setPlayerNames(newNames);
    setEditingIdx(null);
    setTempName("");
    setNameErrors(prev => ({ ...prev, [idx]: "" }));
  };

  const handleExecuteMission = () => {
    if (editingIdx !== null) {
      setNameErrors(prev => ({ ...prev, [editingIdx]: "Save changes first" }));
      if (props.soundEnabled) soundService.playError();
      return;
    }

    const activeNames = props.playerNames.slice(0, props.playerCount);
    let hasError = false;
    const errors: Record<number, string> = {};

    activeNames.forEach((name, idx) => {
      const error = validateName(name);
      if (error) {
        errors[idx] = error;
        hasError = true;
      }
    });

    if (hasError) {
      setNameErrors(errors);
      setShowNameEditor(true);
      if (props.soundEnabled) soundService.playError();
      return;
    }

    props.setMainMode(props.gameCategory === GameCategory.PVE ? MainMode.VIRUS_PURGE : props.mainMode); 
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
        {/* Stepper for Operative Count */}
        <div className="space-y-3 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
          <div className="flex flex-col items-center gap-4">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Active Operatives</label>
            <div className="flex items-center gap-6">
                <button 
                  onClick={() => { if (props.playerCount > MIN_PLAYERS) props.setPlayerCount(props.playerCount - 1); if (props.soundEnabled) soundService.playClick(); }}
                  className="w-12 h-12 rounded-2xl bg-slate-800 border-b-4 border-slate-950 text-white font-black text-2xl flex items-center justify-center active:translate-y-1 active:border-b-0 transition-all"
                >-</button>
                <div className="text-center">
                    <span className="text-5xl font-black text-indigo-400 tabular-nums leading-none">{props.playerCount}</span>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mt-1">Agents Active</p>
                </div>
                <button 
                  onClick={() => { if (props.playerCount < MAX_PLAYERS) props.setPlayerCount(props.playerCount + 1); if (props.soundEnabled) soundService.playClick(); }}
                  className="w-12 h-12 rounded-2xl bg-indigo-600 border-b-4 border-indigo-900 text-white font-black text-2xl flex items-center justify-center active:translate-y-1 active:border-b-0 transition-all"
                >+</button>
            </div>
          </div>
        </div>

        {/* Name Editor Section */}
        <div className="space-y-2">
            <button 
                onClick={() => setShowNameEditor(!showNameEditor)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${showNameEditor ? 'border-indigo-500 bg-indigo-900/20' : 'border-slate-800 bg-slate-800/50'} ${Object.keys(nameErrors).some(k => nameErrors[parseInt(k)]) ? 'border-pink-500' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <svg className={`w-5 h-5 ${Object.keys(nameErrors).some(k => nameErrors[parseInt(k)]) ? 'text-pink-500' : 'text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <div className="text-left">
                        <div className="font-black text-xs uppercase tracking-wider text-slate-100">Operative Identifiers</div>
                        <div className="text-[8px] text-slate-500 font-bold uppercase">Assign Custom Codenames</div>
                    </div>
                </div>
                <div className={`transition-transform duration-300 ${showNameEditor ? 'rotate-180' : ''}`}>▼</div>
            </button>
            <AnimatePresence>
                {showNameEditor && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        className="overflow-hidden bg-slate-900/50 rounded-2xl border border-slate-800 p-3 space-y-2"
                    >
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {props.playerNames.slice(0, props.playerCount).map((name, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className={`flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-xl border transition-all ${editingIdx === idx ? 'border-indigo-500 ring-1 ring-indigo-500/20' : (nameErrors[idx] ? 'border-pink-500/50' : 'border-slate-800')}`}>
                                        <span className="w-6 text-[10px] font-black text-slate-600 text-center">{idx + 1}</span>
                                        {editingIdx === idx ? (
                                            <>
                                                <input 
                                                    autoFocus
                                                    type="text"
                                                    value={tempName}
                                                    onChange={(e) => setTempName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveName(idx);
                                                        if (e.key === 'Escape') cancelEditing();
                                                    }}
                                                    className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-200 placeholder:text-slate-700"
                                                    placeholder="Assign Codename"
                                                />
                                                <div className="flex gap-1 pr-1">
                                                    <button 
                                                        onClick={() => saveName(idx)}
                                                        className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    </button>
                                                    <button 
                                                        onClick={cancelEditing}
                                                        className="p-1.5 text-slate-500 hover:bg-slate-500/10 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div 
                                                    className="flex-1 text-xs font-bold text-slate-200 py-1.5 cursor-pointer"
                                                    onClick={() => startEditing(idx)}
                                                >
                                                    {name}
                                                </div>
                                                <button 
                                                    onClick={() => startEditing(idx)}
                                                    className="p-1.5 text-slate-600 hover:text-indigo-400 transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    {nameErrors[idx] && (
                                        <p className="text-[9px] text-pink-500 font-black uppercase px-2 tracking-tighter animate-in slide-in-from-left-2">
                                            {nameErrors[idx]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {props.gameCategory === GameCategory.PVP ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 px-1">Class</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                  {[GroupMode.CLASSIC, GroupMode.ADVANCED].map((group) => (
                    <button key={group} onClick={() => props.setGroupMode(group)} className={`py-2 rounded-lg font-black text-[9px] uppercase transition-all ${props.groupMode === group ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`} >{group}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 px-1">Mode</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                  {props.groupMode === GroupMode.CLASSIC ? (
                    [MainMode.TERMS, MainMode.SCHEME, MainMode.INQUEST].map((mode) => (
                      <button key={mode} onClick={() => props.setMainMode(mode)} className={`py-2 rounded-lg font-black text-[8px] uppercase transition-all ${props.mainMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-500'}`} >{mode}</button>
                    ))
                  ) : (
                    [MainMode.INVESTMENT, MainMode.PAIR].map((mode) => (
                      <button key={mode} onClick={() => props.setMainMode(mode)} className={`py-2 rounded-lg font-black text-[8px] uppercase transition-all ${props.mainMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-500'}`} >{mode}</button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 px-1">Strategy Profile</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-800/50 p-1 rounded-xl border border-slate-800/50">
                  {[RoleDistributionMode.STANDARD, RoleDistributionMode.CUSTOM, RoleDistributionMode.SURPRISE].map((m) => (
                    <button key={m} onClick={() => props.setRoleDistributionMode(m)} className={`py-2 rounded-lg font-black text-[10px] uppercase transition-all ${props.roleDistributionMode === m ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`} >{m}</button>
                  ))}
                </div>
                
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl animate-in slide-in-from-top-2">
                  {props.roleDistributionMode === RoleDistributionMode.STANDARD && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[11px] font-black uppercase text-slate-500">Imposter Count</span>
                        <span className="text-sm font-black text-pink-500">{props.imposterCount} Active Threats</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => { if (props.imposterCount > 1) props.setImposterCount(props.imposterCount - 1); soundService.playClick(); }}
                          className="w-10 h-10 rounded-xl bg-slate-800 text-white font-black hover:bg-slate-700 active:scale-95 transition-all"
                        >-</button>
                        <div className="flex-1 bg-slate-950 border border-slate-800 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg">
                          {props.imposterCount}
                        </div>
                        <button 
                          onClick={() => { if (props.imposterCount < maxPossibleImposters) props.setImposterCount(props.imposterCount + 1); soundService.playClick(); }}
                          className="w-10 h-10 rounded-xl bg-slate-800 text-white font-black hover:bg-slate-700 active:scale-95 transition-all"
                        >+</button>
                      </div>
                    </div>
                  )}

                  {props.roleDistributionMode === RoleDistributionMode.CUSTOM && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-slate-500">Threats</span>
                        <div className="flex items-center gap-2">
                           <button onClick={() => handleCustomAdjust('imposterCount', -1)} className="w-8 h-8 rounded bg-slate-800 text-white font-black">-</button>
                           <span className="flex-1 text-center font-black text-pink-500">{props.customRoleConfig.imposterCount}</span>
                           <button onClick={() => handleCustomAdjust('imposterCount', 1)} className="w-8 h-8 rounded bg-slate-800 text-white font-black">+</button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-slate-500">Specials</span>
                        <div className="flex items-center gap-2">
                           <button onClick={() => handleCustomAdjust('specialCount', -1)} className="w-8 h-8 rounded bg-slate-800 text-white font-black">-</button>
                           <span className="flex-1 text-center font-black text-indigo-400">{props.customRoleConfig.specialCount}</span>
                           <button onClick={() => handleCustomAdjust('specialCount', 1)} className="w-8 h-8 rounded bg-slate-800 text-white font-black">+</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {props.roleDistributionMode === RoleDistributionMode.SURPRISE && (
                    <div className="space-y-4">
                       <div className="space-y-2">
                         <span className="text-[9px] font-black uppercase text-slate-500">Imposter Range (Min - Max)</span>
                         <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                               <button onClick={() => handleSurpriseAdjust('minImposters', -1)} className="w-6 h-6 rounded bg-slate-800 text-white text-[10px] font-black">-</button>
                               <span className="flex-1 text-center text-[10px] font-black text-pink-500">{props.customRoleConfig.minImposters}</span>
                               <button onClick={() => handleSurpriseAdjust('minImposters', 1)} className="w-6 h-6 rounded bg-slate-800 text-white text-[10px] font-black">+</button>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                               <button onClick={() => handleSurpriseAdjust('maxImposters', -1)} className="w-6 h-6 rounded bg-slate-800 text-white text-[10px] font-black">-</button>
                               <span className="flex-1 text-center text-[10px] font-black text-pink-500">{props.customRoleConfig.maxImposters}</span>
                               <button onClick={() => handleSurpriseAdjust('maxImposters', 1)} className="w-6 h-6 rounded bg-slate-800 text-white text-[10px] font-black">+</button>
                            </div>
                         </div>
                       </div>
                       <div className="space-y-2">
                         <span className="text-[9px] font-black uppercase text-slate-500">Special Range (Min - Max)</span>
                         <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                               <button onClick={() => handleSurpriseAdjust('minSpecials', -1)} className="w-6 h-6 rounded bg-slate-800 text-white text-[10px] font-black">-</button>
                               <span className="flex-1 text-center text-[10px] font-black text-indigo-400">{props.customRoleConfig.minSpecials}</span>
                               <button onClick={() => handleSurpriseAdjust('minSpecials', 1)} className="w-6 h-6 rounded bg-slate-800 text-white text-[10px] font-black">+</button>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                               <button onClick={() => handleSurpriseAdjust('maxSpecials', -1)} className="w-6 h-6 rounded bg-slate-800 text-white text-[10px] font-black">-</button>
                               <span className="flex-1 text-center text-[10px] font-black text-indigo-400">{props.customRoleConfig.maxSpecials}</span>
                               <button onClick={() => handleSurpriseAdjust('maxSpecials', 1)} className="w-6 h-6 rounded bg-slate-800 text-white text-[10px] font-black">+</button>
                            </div>
                         </div>
                       </div>
                    </div>
                  )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => setShowExtraRoles(!showExtraRoles)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-95 ${showExtraRoles ? 'border-indigo-500 bg-indigo-900/20' : 'border-slate-800 bg-slate-800/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg"><svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
                    <div className="text-left"><div className="font-black text-xs uppercase tracking-wider text-slate-100">Special Operatives</div><div className="text-[8px] text-slate-500 font-bold uppercase">Toggle Inclusions</div></div>
                  </div>
                  <div className={`transition-transform duration-300 ${showExtraRoles ? 'rotate-180' : ''}`}>▼</div>
              </button>
              <AnimatePresence>
                {showExtraRoles && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-1 p-2 bg-slate-900/50 rounded-2xl border border-slate-800">
                    {[
                      { r: Role.MR_WHITE, state: props.hasMrWhite, toggle: () => props.setHasMrWhite(!props.hasMrWhite) },
                      { r: Role.ANARCHIST, state: props.hasAnarchist, toggle: () => props.setHasAnarchist(!props.hasAnarchist) },
                      { r: Role.MIMIC, state: props.hasMimic, toggle: () => props.setHasMimic(!props.hasMimic) },
                      { r: Role.ORACLE, state: props.hasOracle, toggle: () => props.setHasOracle(!props.hasOracle) },
                    ].map(item => (
                      <button key={item.r} onClick={item.toggle} className={`w-full p-2.5 rounded-xl border-2 flex justify-between items-center transition-all ${item.state ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
                         <span className={`text-[10px] font-black uppercase ${item.state ? 'text-white' : 'text-slate-600'}`}>{item.r}</span>
                         <div className={`w-3.5 h-3.5 rounded-full border-2 ${item.state ? 'bg-indigo-500 border-indigo-300' : 'border-slate-700'}`} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 px-1">Gameplay Rules</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { soundService.playClick(); props.setGameMode(props.gameMode === GameMode.MYSTERIOUS ? GameMode.NORMAL : GameMode.MYSTERIOUS); }} className={`p-4 rounded-xl border-2 text-[10px] font-black uppercase transition-all shadow-lg active:scale-[0.98] ${props.gameMode === GameMode.MYSTERIOUS ? 'border-indigo-500 bg-indigo-600 text-white font-black' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'}`}>Mysterious</button>
                    <button onClick={() => { soundService.playClick(); props.setIncludeTaboo(!props.includeTaboo); }} className={`p-4 rounded-xl border-2 text-[10px] font-black uppercase transition-all shadow-lg active:scale-[0.98] ${props.includeTaboo ? 'border-purple-500 bg-purple-600 text-white font-black' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'}`}>Taboo Mode</button>
                    <button onClick={() => { soundService.playClick(); props.setIsAuctionActive(!props.isAuctionActive); }} className={`p-4 rounded-xl border-2 text-[10px] font-black uppercase transition-all shadow-lg active:scale-[0.98] ${props.isAuctionActive ? 'border-yellow-500 bg-yellow-600 text-white font-black' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'}`}>Auction Mode</button>
                    <button disabled={!props.isAuctionActive} onClick={() => { soundService.playClick(); props.setIsBlindBidding(!props.isBlindBidding); }} className={`p-4 rounded-xl border-2 text-[10px] font-black uppercase transition-all shadow-lg active:scale-[0.98] ${props.isBlindBidding ? 'border-orange-500 bg-orange-600 text-white font-black' : 'border-slate-800 bg-slate-900 text-slate-500 disabled:opacity-40 hover:border-slate-700'}`}>Blind Bidding</button>
                </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-teal-900/20 border-2 border-teal-500/30 p-4 rounded-3xl space-y-2">
              <h3 className="font-black text-teal-400 uppercase tracking-widest text-xs">Virus Purge (Co-op)</h3>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Humans vs The Boss. One secret virus word. Multiple noise words. All players are <span className="text-white font-bold underline decoration-teal-500">Civilians</span>.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Virus Word Database</label>
                <button onClick={selectAllSets} className="text-[9px] font-black text-teal-500 uppercase hover:text-teal-400">Select All</button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                {props.virusSets.map(set => (
                  <button key={set.id} onClick={() => {
                    const next = props.activeVirusSetIds.includes(set.id) ? props.activeVirusSetIds.filter(x => x !== set.id) : [...props.activeVirusSetIds, set.id];
                    if (next.length > 0) props.setActiveVirusSetIds(next);
                  }} className={`px-3 py-2 rounded-xl text-[10px] font-bold text-left border ${props.activeVirusSetIds.includes(set.id) ? 'bg-teal-600 border-teal-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`} > {set.name} </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="space-y-3 mt-4">
            <label className="text-[10px] font-black uppercase text-slate-500 px-1">Mission Protocol Engine</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
               <button 
                 onClick={() => { soundService.playClick(); props.setUseAiMissions(false); }} 
                 className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${!props.useAiMissions ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
               > Standard Library </button>
               <button 
                 onClick={() => { soundService.playClick(); props.setUseAiMissions(true); }} 
                 className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${props.useAiMissions ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
               > AI Generated </button>
            </div>
            {props.useAiMissions && (
                <div className="flex items-center gap-1 px-2 animate-in slide-in-from-left duration-300">
                    <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Neural Link: Rate limits apply</span>
                </div>
            )}
        </div>

        <AnimatePresence>
            {!props.useAiMissions && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black uppercase text-slate-500">Shared Mission Assets</label>
                      <button onClick={selectAllSets} className="text-[9px] font-black text-indigo-500 uppercase hover:text-indigo-400">Select All</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                        {currentSets.map(set => (
                        <button key={set.id} onClick={() => toggleSet(set.id)} className={`px-3 py-2 rounded-xl text-[10px] font-bold text-left transition-all border ${currentActiveIds.includes(set.id) ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`} > {set.name} </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {props.useAiMissions && (
            <div className="p-4 bg-indigo-900/10 border-2 border-dashed border-indigo-500/30 rounded-3xl text-center">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Neural Link Active</p>
                <p className="text-[9px] text-slate-500 mt-1">Unique project data will be synthetically generated upon mission start.</p>
            </div>
        )}
      </div>

      <button onClick={handleExecuteMission} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all mt-4 border-b-4 border-indigo-900 shrink-0" > EXECUTE OPERATION </button>
    </div>
  );
};

export default Setup;
