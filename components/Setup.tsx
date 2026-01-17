import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, GameMode, MainMode, GroupMode, ScenarioSet, InquestSet, WordSet, RoleDistributionMode, CustomRoleConfig, GameCategory, VirusSet } from '../types';
import { MIN_PLAYERS, MAX_PLAYERS } from '../constants';
import { soundService } from '../services/soundService';

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
  hasSaboteur: boolean;
  setHasSaboteur: (b: boolean) => void;
  hasMercenary: boolean;
  setHasMercenary: (b: boolean) => void;
  hasHunter: boolean;
  setHasHunter: (b: boolean) => void;
  hasSeer: boolean;
  setHasSeer: (b: boolean) => void;
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
  virusSets: VirusSet[];
  activeVirusSetIds: string[];
  setActiveVirusSetIds: (ids: string[]) => void;
  onStart: () => void;
  imposterCount: number;
  setImposterCount: (n: number) => void;
  useAiMissions: boolean;
  setUseAiMissions: (b: boolean) => void;
  isAuctionActive: boolean;
  setIsAuctionActive: (b: boolean) => void;
  playerNames: string[];
  setPlayerNames: (names: string[]) => void;
  meetingTimerSettings: any;
  setMeetingTimerSettings: (settings: any) => void;
  includeHints: boolean;
  setIncludeHints: (b: boolean) => void;
}


const FORBIDDEN_NAMES = ['neighbor', 'imposter', 'mr. white', 'mr white', 'anarchist', 'mimic', 'the mimic', 'oracle', 'the oracle', 'bounty hunter'];

const Setup: React.FC<SetupProps> = (props) => {
  const [showExtraRoles, setShowExtraRoles] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");

  const maxPossibleImposters = Math.floor(props.playerCount / 2);

  const toggleSet = (id: string) => {
    if (!id?.trim()) return;
    
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

  const handleExecuteMission = () => {
    props.onStart();
  };

  const updateName = (idx: number, newName: string) => {
    if (idx < 0 || idx >= props.playerNames.length || !newName?.trim()) return;
    
    const updated = [...props.playerNames];
    updated[idx] = newName.trim();
    props.setPlayerNames(updated);
  };

  const currentSets = (props.mainMode === MainMode.TERMS || props.mainMode === MainMode.PAIR || props.mainMode === MainMode.VIRUS_PURGE) ? props.wordSets : (props.mainMode === MainMode.SCHEME || props.mainMode === MainMode.INVESTMENT ? props.scenarioSets : props.inquestSets);
  const currentActiveIds = (props.mainMode === MainMode.TERMS || props.mainMode === MainMode.PAIR || props.mainMode === MainMode.VIRUS_PURGE) ? props.activeWordSetIds : (props.mainMode === MainMode.SCHEME || props.mainMode === MainMode.INVESTMENT ? props.activeSetIds : props.activeInquestSetIds);

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-500 pb-8 relative">
      <div className="text-center shrink-0">
        <h2 className="text-3xl font-black text-indigo-400 uppercase tracking-tighter">Mission Briefing</h2>
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">{props.gameCategory}</p>
      </div>

      <div className="space-y-5 overflow-y-auto pr-1 custom-scrollbar flex-1 pb-6">
        
        {/* Player Count & Names */}
        <div className="space-y-3 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-center relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
               <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Active Operatives</label>
               <button onClick={() => setShowNameEditor(true)} className="text-[9px] font-black uppercase text-indigo-400 tracking-wider hover:text-indigo-300">Edit Codenames</button>
            </div>
            <div className="flex items-center justify-center gap-6 relative z-10">
                <button onClick={() => { if (props.playerCount > MIN_PLAYERS) props.setPlayerCount(props.playerCount - 1); }} className="w-12 h-12 rounded-2xl bg-slate-800 border-b-4 border-slate-950 text-white font-black text-2xl flex items-center justify-center active:translate-y-1 transition-all">-</button>
                <div className="text-center"><span className="text-5xl font-black text-indigo-400 tabular-nums">{props.playerCount}</span></div>
                <button onClick={() => { if (props.playerCount < MAX_PLAYERS) props.setPlayerCount(props.playerCount + 1); }} className="w-12 h-12 rounded-2xl bg-indigo-600 border-b-4 border-indigo-900 text-white font-black text-2xl flex items-center justify-center active:translate-y-1 transition-all">+</button>
            </div>
        </div>

        {/* PvP Specific Settings */}
        {props.gameCategory === GameCategory.PVP && (
          <>
            <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 flex items-center justify-between">
               <label className="text-[11px] font-black uppercase text-pink-500 tracking-wider">Imposters</label>
               <div className="flex items-center gap-4">
                  <button onClick={() => props.setImposterCount(Math.max(1, props.imposterCount - 1))} className="w-8 h-8 rounded-xl bg-slate-800 text-pink-500 font-black flex items-center justify-center border border-slate-700">-</button>
                  <span className="text-xl font-black text-white w-4 text-center">{props.imposterCount}</span>
                  <button onClick={() => props.setImposterCount(Math.min(maxPossibleImposters, props.imposterCount + 1))} className="w-8 h-8 rounded-xl bg-pink-600 text-white font-black flex items-center justify-center border-b-2 border-pink-900 shadow-lg shadow-pink-500/20">+</button>
               </div>
            </div>

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
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-1 p-2 bg-slate-900/50 rounded-2xl border border-slate-800">
                    {[
                      { r: Role.MR_WHITE, state: props.hasMrWhite, toggle: () => props.setHasMrWhite(!props.hasMrWhite), team: 'Imposter' },
                      { r: Role.SABOTEUR, state: props.hasSaboteur, toggle: () => props.setHasSaboteur(!props.hasSaboteur), team: 'Rogue' },
                      { r: Role.MERCENARY, state: props.hasMercenary, toggle: () => props.setHasMercenary(!props.hasMercenary), team: 'Neutral' },
                      { r: Role.HUNTER, state: props.hasHunter, toggle: () => props.setHasHunter(!props.hasHunter), team: 'Neighbor' },
                      { r: Role.SEER, state: props.hasSeer, toggle: () => props.setHasSeer(!props.hasSeer), team: 'Neighbor' },
                    ].map(item => (
                      <button key={item.r} onClick={item.toggle} className={`w-full p-2.5 rounded-xl border-2 flex justify-between items-center transition-all ${item.state ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800'}`}>
                         <div className="flex flex-col text-left">
                           <span className={`text-[10px] font-black uppercase ${item.state ? 'text-white' : 'text-slate-600'}`}>{item.r}</span>
                           <span className="text-[7px] font-black uppercase text-slate-500">{item.team} Team</span>
                         </div>
                         <div className={`w-3.5 h-3.5 rounded-full border-2 ${item.state ? 'bg-indigo-500 border-indigo-300' : 'border-slate-700'}`} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 px-1">Game Protocol</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => props.setGameMode(props.gameMode === GameMode.MYSTERIOUS ? GameMode.NORMAL : GameMode.MYSTERIOUS)} className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${props.gameMode === GameMode.MYSTERIOUS ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>Mysterious</button>
                    <button onClick={() => props.setIncludeTaboo(!props.includeTaboo)} className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${props.includeTaboo ? 'border-purple-500 bg-purple-600 text-white shadow-lg' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>Taboo Mode</button>
                    <button onClick={() => props.setIsAuctionActive(!props.isAuctionActive)} className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${props.isAuctionActive ? 'border-yellow-500 bg-yellow-600 text-white shadow-lg' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>Auction</button>
                    <button onClick={() => props.setIncludeHints(!props.includeHints)} className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${props.includeHints ? 'border-cyan-500 bg-cyan-600 text-white shadow-lg' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>{props.includeHints ? 'Imposter Hints: ON' : 'Imposter Hints: OFF'}</button>
                </div>
            </div>
          </>
        )}

        {/* Mission Content Selection */}
        <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase text-slate-500">Mission Content</label>
              {!props.useAiMissions && <button onClick={selectAllSets} className="text-[9px] font-black text-indigo-500 uppercase">All</button>}
            </div>
            
            <button 
              onClick={() => props.setUseAiMissions(!props.useAiMissions)} 
              className={`w-full p-4 mb-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${props.useAiMissions ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(129,140,248,0.2)]' : 'border-slate-800 bg-slate-900 text-slate-500'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {props.useAiMissions ? 'AI GENERATED MISSIONS ACTIVE' : 'ENABLE AI GENERATED MISSIONS'}
            </button>

            {!props.useAiMissions && (
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar animate-in fade-in duration-300">
                  {currentSets.map(set => (
                  <button key={set.id} onClick={() => toggleSet(set.id)} className={`px-3 py-2 rounded-xl text-[10px] font-bold text-left border ${currentActiveIds.includes(set.id) ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`} > {set.name} </button>
                  ))}
              </div>
            )}
        </div>

        {/* Timer Settings */}
        <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 mb-6">
          <h3 className="text-lg font-black text-slate-100 mb-4">Meeting Timer Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-2">Round 1 (Statements)</label>
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => props.setMeetingTimerSettings({...props.meetingTimerSettings, round1Duration: 60})}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition-all ${props.meetingTimerSettings?.round1Duration === 60 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  60s
                </button>
                <button 
                  onClick={() => props.setMeetingTimerSettings({...props.meetingTimerSettings, round1Duration: 90})}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition-all ${props.meetingTimerSettings?.round1Duration === 90 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  90s
                </button>
                <button 
                  onClick={() => props.setMeetingTimerSettings({...props.meetingTimerSettings, round1Duration: 120})}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition-all ${props.meetingTimerSettings?.round1Duration === 120 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  120s
                </button>
                <button 
                  onClick={() => {
                    const custom = prompt('Enter custom seconds for Round 1:');
                    if (custom && !isNaN(Number(custom))) {
                      props.setMeetingTimerSettings({...props.meetingTimerSettings, round1Duration: Number(custom)});
                    }
                  }}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition-all ${props.meetingTimerSettings?.round1Duration && props.meetingTimerSettings.round1Duration > 120 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  Custom
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-2">Round 2 (Debate)</label>
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => props.setMeetingTimerSettings({...props.meetingTimerSettings, round2Duration: 45})}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition-all ${props.meetingTimerSettings?.round2Duration === 45 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  45s
                </button>
                <button 
                  onClick={() => props.setMeetingTimerSettings({...props.meetingTimerSettings, round2Duration: 60})}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition-all ${props.meetingTimerSettings?.round2Duration === 60 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  60s
                </button>
                <button 
                  onClick={() => props.setMeetingTimerSettings({...props.meetingTimerSettings, round2Duration: 90})}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition-all ${props.meetingTimerSettings?.round2Duration === 90 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  90s
                </button>
                <button 
                  onClick={() => {
                    const custom = prompt('Enter custom seconds for Round 2:');
                    if (custom && !isNaN(Number(custom))) {
                      props.setMeetingTimerSettings({...props.meetingTimerSettings, round2Duration: Number(custom)});
                    }
                  }}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition-all ${props.meetingTimerSettings?.round2Duration && props.meetingTimerSettings.round2Duration > 90 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  Custom
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-2">Round 3 (Defense)</label>
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => props.setMeetingTimerSettings({...props.meetingTimerSettings, round3Duration: 30})}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition-all ${props.meetingTimerSettings?.round3Duration === 30 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  30s
                </button>
                <button 
                  onClick={() => props.setMeetingTimerSettings({...props.meetingTimerSettings, round3Duration: 45})}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition-all ${props.meetingTimerSettings?.round3Duration === 45 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  45s
                </button>
                <button 
                  onClick={() => props.setMeetingTimerSettings({...props.meetingTimerSettings, round3Duration: 60})}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition-all ${props.meetingTimerSettings?.round3Duration === 60 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  60s
                </button>
                <button 
                  onClick={() => {
                    const custom = prompt('Enter custom seconds for Round 3:');
                    if (custom && !isNaN(Number(custom))) {
                      props.setMeetingTimerSettings({...props.meetingTimerSettings, round3Duration: Number(custom)});
                    }
                  }}
                  className={`py-2 px-3 rounded-lg font-black text-xs transition-all ${props.meetingTimerSettings?.round3Duration && props.meetingTimerSettings.round3Duration > 60 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  Custom
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Start Button */}
        <div className="flex justify-center mt-6">
          <button 
            onClick={handleExecuteMission}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-xl shadow-xl border-b-4 border-indigo-900 active:scale-95 transition-all mt-4 relative z-10" > EXECUTE MISSION </button>
        </div>

      {/* Name Editor Modal */}
      <AnimatePresence>
        {showNameEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex flex-col p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-white uppercase tracking-tighter">Edit Codenames</h3>
               <button onClick={() => setShowNameEditor(false)} className="p-2 bg-slate-800 rounded-full text-slate-400">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {Array.from({length: props.playerCount}).map((_, i) => (
                <div key={i} className="flex gap-2">
                   <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-slate-500 shrink-0">#{i + 1}</div>
                   <input 
                      type="text" 
                      value={props.playerNames[i]}
                      onChange={(e) => updateName(i, e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 font-bold text-white focus:border-indigo-500 outline-none"
                      placeholder={`Agent ${i + 1}`}
                   />
                </div>
              ))}
            </div>
            <button onClick={() => setShowNameEditor(false)} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase mt-4 shadow-xl">Confirm Roster</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Setup;