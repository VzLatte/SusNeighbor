
import React, { useState } from 'react';
import { ScenarioSet, InquestSet, InquestScenario, WordSet, WordPair, VirusSet } from '../types';
import { soundService } from '../services/soundService';

interface SettingsProps {
  scenarioSets: ScenarioSet[];
  wordSets: WordSet[];
  inquestSets: InquestSet[];
  virusSets: VirusSet[];
  onSave: (scenarioSets: ScenarioSet[], inquestSets: InquestSet[], wordSets: WordSet[], virusSets: VirusSet[]) => void;
  onBack: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (b: boolean) => void;
  musicEnabled: boolean;
  setMusicEnabled: (b: boolean) => void;
  bgAnimationEnabled: boolean;
  setBgAnimationEnabled: (b: boolean) => void;
  slotMachineEnabled: boolean;
  setSlotMachineEnabled: (b: boolean) => void;
  meetingDuration: number;
  setMeetingDuration: (n: number) => void;
  lastStandDuration: number;
  setLastStandDuration: (n: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  scenarioSets, wordSets, inquestSets, virusSets, onSave, onBack, 
  soundEnabled, setSoundEnabled, musicEnabled, setMusicEnabled, 
  bgAnimationEnabled, setBgAnimationEnabled,
  slotMachineEnabled, setSlotMachineEnabled,
  meetingDuration, setMeetingDuration, lastStandDuration, setLastStandDuration 
}) => {
  const [activeTab, setActiveTab] = useState<'PACKS' | 'GENERAL'>('PACKS');
  const [packType, setPackType] = useState<'TERMS' | 'SCHEME' | 'INQUEST' | 'VIRUS'>('TERMS');
  const [infoModal, setInfoModal] = useState<{ title: string, content: React.ReactNode } | null>(null);
  
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [tempWordSet, setTempWordSet] = useState<WordSet | null>(null);
  const [tempSchemeSet, setTempSchemeSet] = useState<ScenarioSet | null>(null);
  const [tempInquestSet, setTempInquestSet] = useState<InquestSet | null>(null);
  const [tempVirusSet, setTempVirusSet] = useState<VirusSet | null>(null);

  const [secretClicks, setSecretClicks] = useState(0);
  const [isSecretActive, setIsSecretActive] = useState(false);
  const [isSecretPlaying, setIsSecretPlaying] = useState(false);

  const APP_VERSION = "v2.2.0-Alpha";

  const handleSecretTrigger = () => {
    const nextCount = secretClicks + 1;
    if (nextCount >= 7) {
      if (soundEnabled) soundService.playReveal();
      setIsSecretActive(true);
      setSecretClicks(0);
    } else {
      setSecretClicks(nextCount);
      if (soundEnabled) soundService.playClick();
    }
  };

  const toggleSecretMusic = async () => {
    if (isSecretPlaying) {
      soundService.stopBGM();
      setIsSecretPlaying(false);
    } else {
      // Direct await on user interaction is critical for some browsers to allow AudioContext resume
      await soundService.startBGM('SECRET');
      setIsSecretPlaying(true);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Imposter Purge',
      text: 'Join the protocol. Unmask the traitors. A high-stakes social deduction engine.',
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.log('Share failed', err);
    }
  };

  const handleCreateNew = () => {
    const id = Date.now().toString();
    if (packType === 'TERMS') {
      setTempWordSet({ id, name: 'New Word Pack', pairs: [{ wordA: '', wordB: '' }] });
      setEditingSetId(id);
    } else if (packType === 'SCHEME') {
      setTempSchemeSet({ id, name: 'New Scheme Pack', projects: [], locations: [], catches: [] });
      setEditingSetId(id);
    } else if (packType === 'INQUEST') {
      setTempInquestSet({ id, name: 'New Inquest Pack', scenarios: [] });
      setEditingSetId(id);
    } else if (packType === 'VIRUS') {
      setTempVirusSet({ id, name: 'New Virus Pack', words: [] });
      setEditingSetId(id);
    }
  };

  const handleSaveEdit = () => {
    if (packType === 'TERMS' && tempWordSet) {
      const updated = wordSets.some(s => s.id === tempWordSet.id) 
        ? wordSets.map(s => s.id === tempWordSet.id ? tempWordSet : s)
        : [...wordSets, tempWordSet];
      onSave(scenarioSets, inquestSets, updated, virusSets);
    } else if (packType === 'SCHEME' && tempSchemeSet) {
      const updated = scenarioSets.some(s => s.id === tempSchemeSet.id)
        ? scenarioSets.map(s => s.id === tempSchemeSet.id ? tempSchemeSet : s)
        : [...scenarioSets, tempSchemeSet];
      onSave(updated, inquestSets, wordSets, virusSets);
    } else if (packType === 'INQUEST' && tempInquestSet) {
      const updated = inquestSets.some(s => s.id === tempInquestSet.id)
        ? inquestSets.map(s => s.id === tempInquestSet.id ? tempInquestSet : s)
        : [...inquestSets, tempInquestSet];
      onSave(scenarioSets, updated, wordSets, virusSets);
    } else if (packType === 'VIRUS' && tempVirusSet) {
      const updated = virusSets.some(s => s.id === tempVirusSet.id)
        ? virusSets.map(s => s.id === tempVirusSet.id ? tempVirusSet : s)
        : [...virusSets, tempVirusSet];
      onSave(scenarioSets, inquestSets, wordSets, updated);
    }
    setEditingSetId(null);
  };

  const handleDelete = (id: string) => {
    if (packType === 'TERMS') onSave(scenarioSets, inquestSets, wordSets.filter(s => s.id !== id), virusSets);
    if (packType === 'SCHEME') onSave(scenarioSets.filter(s => id !== id), inquestSets, wordSets, virusSets);
    if (packType === 'INQUEST') onSave(scenarioSets, inquestSets.filter(s => s.id !== id), wordSets, virusSets);
    if (packType === 'VIRUS') onSave(scenarioSets, inquestSets, wordSets, virusSets.filter(s => s.id !== id));
  };

  if (editingSetId) {
    return (
      <div className="flex-1 flex flex-col space-y-4 h-full">
        <h2 className="text-2xl font-black uppercase text-indigo-400 shrink-0">Edit Pack</h2>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar pb-10">
          {packType === 'TERMS' && tempWordSet && (
            <>
              <input value={tempWordSet.name} onChange={e => setTempWordSet({...tempWordSet, name: e.target.value})} className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 font-bold" placeholder="Pack Name" />
              <div className="space-y-2">
                {tempWordSet.pairs.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                    <input value={p.wordA} onChange={e => { const newPairs = [...tempWordSet.pairs]; newPairs[i].wordA = e.target.value; setTempWordSet({...tempWordSet, pairs: newPairs}); }} className="flex-1 bg-slate-800 p-2 rounded text-xs" placeholder="Word A" />
                    <input value={p.wordB} onChange={e => { const newPairs = [...tempWordSet.pairs]; newPairs[i].wordB = e.target.value; setTempWordSet({...tempWordSet, pairs: newPairs}); }} className="flex-1 bg-slate-800 p-2 rounded text-xs" placeholder="Word B" />
                    <button onClick={() => setTempWordSet({...tempWordSet, pairs: tempWordSet.pairs.filter((_, idx) => idx !== i)})} className="text-red-500 font-bold px-2">×</button>
                  </div>
                ))}
                <button onClick={() => setTempWordSet({...tempWordSet, pairs: [...tempWordSet.pairs, {wordA: '', wordB: ''}]})} className="w-full py-2 bg-slate-800 rounded-lg text-[10px] font-bold uppercase text-slate-400">+ Add Pair</button>
              </div>
            </>
          )}
          {packType === 'SCHEME' && tempSchemeSet && (
            <>
              <input value={tempSchemeSet.name} onChange={e => setTempSchemeSet({...tempSchemeSet, name: e.target.value})} className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 font-bold" placeholder="Pack Name" />
              <div className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase">Projects (One per line)</label>
                   <textarea value={tempSchemeSet.projects.join('\n')} onChange={e => setTempSchemeSet({...tempSchemeSet, projects: e.target.value.split('\n')})} className="w-full h-24 bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs" placeholder="Dog Park..." />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase">Locations (One per line)</label>
                   <textarea value={tempSchemeSet.locations.join('\n')} onChange={e => setTempSchemeSet({...tempSchemeSet, locations: e.target.value.split('\n')})} className="w-full h-24 bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs" placeholder="Mall..." />
                 </div>
              </div>
            </>
          )}
          {packType === 'VIRUS' && tempVirusSet && (
            <>
              <input value={tempVirusSet.name} onChange={e => setTempVirusSet({...tempVirusSet, name: e.target.value})} className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 font-bold" placeholder="Pack Name" />
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Words (One per line)</label>
                <textarea value={tempVirusSet.words.join('\n')} onChange={e => setTempVirusSet({...tempVirusSet, words: e.target.value.split('\n')})} className="w-full h-48 bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs" placeholder="Encryption..." />
              </div>
            </>
          )}
          {packType === 'INQUEST' && tempInquestSet && (
            <>
              <input value={tempInquestSet.name} onChange={e => setTempInquestSet({...tempInquestSet, name: e.target.value})} className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 font-bold" placeholder="Pack Name" />
              <div className="space-y-4">
                {tempInquestSet.scenarios.map((sc, i) => (
                  <div key={i} className="p-4 bg-slate-900 border border-slate-700 rounded-2xl space-y-3 relative">
                    <button onClick={() => setTempInquestSet({...tempInquestSet, scenarios: tempInquestSet.scenarios.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 text-red-500 font-black">×</button>
                    <div className="grid grid-cols-2 gap-2">
                       <input value={sc.realProject} onChange={e => { const n = [...tempInquestSet.scenarios]; n[i].realProject = e.target.value; setTempInquestSet({...tempInquestSet, scenarios: n}); }} className="bg-slate-800 p-2 rounded text-xs" placeholder="Real Word" />
                       <input value={sc.fakeProject} onChange={e => { const n = [...tempInquestSet.scenarios]; n[i].fakeProject = e.target.value; setTempInquestSet({...tempInquestSet, scenarios: n}); }} className="bg-slate-800 p-2 rounded text-xs" placeholder="Fake Word" />
                    </div>
                    <input value={sc.location} onChange={e => { const n = [...tempInquestSet.scenarios]; n[i].location = e.target.value; setTempInquestSet({...tempInquestSet, scenarios: n}); }} className="w-full bg-slate-800 p-2 rounded text-xs" placeholder="Location" />
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase">Questions (3)</p>
                      {sc.questions.map((q, qi) => (
                        <input key={qi} value={q} onChange={e => { const n = [...tempInquestSet.scenarios]; n[i].questions[qi] = e.target.value; setTempInquestSet({...tempInquestSet, scenarios: n}); }} className="w-full bg-slate-800 p-2 rounded text-[10px]" placeholder={`Q${qi+1}`} />
                      ))}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase">Options (4)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {sc.options.map((o, oi) => (
                          <input key={oi} value={o} onChange={e => { const n = [...tempInquestSet.scenarios]; n[i].options[oi] = e.target.value; setTempInquestSet({...tempInquestSet, scenarios: n}); }} className="bg-slate-800 p-2 rounded text-[10px]" placeholder={`Opt ${oi+1}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setTempInquestSet({...tempInquestSet, scenarios: [...tempInquestSet.scenarios, { id: Date.now().toString(), realProject: '', fakeProject: '', location: '', options: ['', '', '', ''], questions: ['', '', ''] }]})} className="w-full py-4 bg-slate-800 rounded-2xl font-black uppercase text-xs">+ Add Scenario</button>
              </div>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <button onClick={() => setEditingSetId(null)} className="py-4 bg-slate-800 rounded-2xl font-black uppercase text-xs">Cancel</button>
          <button onClick={handleSaveEdit} className="py-4 bg-indigo-600 rounded-2xl font-black uppercase text-xs text-white shadow-lg shadow-indigo-500/20">Save Pack</button>
        </div>
      </div>
    );
  }

  const renderSetItem = (set: any, label: string) => (
    <div key={set.id} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex justify-between items-center group">
        <div className="flex-1"><h3 className="font-bold text-sm truncate pr-2">{set.name}</h3><p className="text-[10px] text-slate-500 uppercase">{label}</p></div>
        <div className="flex gap-2 shrink-0">
            <button onClick={() => {
                if (packType === 'TERMS') setTempWordSet({...set});
                if (packType === 'SCHEME') setTempSchemeSet({...set});
                if (packType === 'INQUEST') setTempInquestSet({...set});
                if (packType === 'VIRUS') setTempVirusSet({...set});
                setEditingSetId(set.id);
            }} className="p-2.5 text-indigo-400 bg-slate-900 rounded-xl hover:bg-indigo-500/10 active:scale-95 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={() => handleDelete(set.id)} className="p-2.5 text-red-500 bg-slate-900 rounded-xl hover:bg-red-500/10 active:scale-95 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col space-y-6 h-full overflow-hidden relative">
      <div className="text-center shrink-0">
        <h2 className="text-3xl font-black text-indigo-400 tracking-tighter uppercase">Command Center</h2>
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">System Configuration</p>
      </div>
      
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shrink-0">
        <button onClick={() => setActiveTab('PACKS')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'PACKS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}>Packs & Sets</button>
        <button onClick={() => setActiveTab('GENERAL')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'GENERAL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}>General</button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {activeTab === 'PACKS' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 sticky top-0 z-10 shadow-lg">
               {(['TERMS', 'SCHEME', 'INQUEST', 'VIRUS'] as const).map(t => (
                 <button key={t} onClick={() => setPackType(t)} className={`py-2 rounded-lg text-[9px] font-black uppercase transition-all ${packType === t ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-500/30' : 'text-slate-600'}`}>{t}</button>
               ))}
            </div>

            <button onClick={handleCreateNew} className="w-full py-4 bg-indigo-600/10 border-2 border-dashed border-indigo-500/30 text-indigo-400 font-black rounded-2xl text-[10px] uppercase active:scale-[0.98] transition-all hover:bg-indigo-500/5 shrink-0">+ Create Custom {packType} Pack</button>

            <div className="space-y-3 pb-8 min-h-[100px]">
               {packType === 'TERMS' && wordSets.map(set => renderSetItem(set, `${set.pairs.length} Content Pairs`))}
               {packType === 'SCHEME' && scenarioSets.map(set => renderSetItem(set, `${set.projects.length} Operations`))}
               {packType === 'INQUEST' && inquestSets.map(set => renderSetItem(set, `${set.scenarios.length} Scenarios`))}
               {packType === 'VIRUS' && virusSets.map(set => renderSetItem(set, `${set.words.length} Virus Words`))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Sensory & Environment</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl border border-slate-700">
                    <span className="font-bold uppercase text-xs tracking-widest">Sound FX</span>
                    <button onClick={() => setSoundEnabled(!soundEnabled)} className={`w-12 h-6 rounded-full relative transition-all ${soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${soundEnabled ? 'left-7' : 'left-1'}`} /></button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl border border-slate-700">
                    <span className="font-bold uppercase text-xs tracking-widest">Atmosphere (BGM)</span>
                    <button onClick={() => setMusicEnabled(!musicEnabled)} className={`w-12 h-6 rounded-full relative transition-all ${musicEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${musicEnabled ? 'left-7' : 'left-1'}`} /></button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl border border-slate-700">
                    <span className="font-bold uppercase text-xs tracking-widest">Dynamic Background</span>
                    <button onClick={() => setBgAnimationEnabled(!bgAnimationEnabled)} className={`w-12 h-6 rounded-full relative transition-all ${bgAnimationEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${bgAnimationEnabled ? 'left-7' : 'left-1'}`} /></button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl border border-slate-700">
                    <span className="font-bold uppercase text-xs tracking-widest">Slot Machine Reveal</span>
                    <button onClick={() => setSlotMachineEnabled(!slotMachineEnabled)} className={`w-12 h-6 rounded-full relative transition-all ${slotMachineEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${slotMachineEnabled ? 'left-7' : 'left-1'}`} /></button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Neural Infrastructure</h4>
              <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </div>
                   <div className="text-left">
                      <div className="font-black text-xs uppercase tracking-wider text-slate-100">Google Gemini API</div>
                      <div className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest">AI Service Status: Active</div>
                   </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  AI-generated missions are subject to global rate limits (Requests Per Minute/Day). If quotas are exceeded, the system automatically transitions to the local Standard Library to ensure mission continuity.
                </p>
              </div>
            </div>

            {isSecretActive && (
              <div className="space-y-4 animate-in zoom-in duration-300">
                <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest px-2">Neural Override Active</h4>
                <div className="p-5 bg-pink-900/10 border-2 border-pink-500/30 rounded-3xl flex flex-col items-center gap-4 shadow-lg shadow-pink-500/10">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isSecretPlaying ? 'bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)] animate-bounce' : 'bg-slate-700 opacity-50'}`}>
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19V5l12 7-12 7z" /></svg>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">Secret Channel: Rave 01</p>
                      <button 
                        onClick={toggleSecretMusic}
                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isSecretPlaying ? 'bg-slate-800 text-pink-500 border border-pink-500/50' : 'bg-pink-600 text-white shadow-lg shadow-pink-500/20'}`}
                      >
                         {isSecretPlaying ? 'STOP DECRYPTION' : 'INITIALIZE AUDIO'}
                      </button>
                   </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Temporal Protocols</h4>
              <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><label className="text-xs font-bold text-slate-300 uppercase">Debate Window</label><span className="text-xs font-black text-indigo-400">{Math.floor(meetingDuration / 60)}m {meetingDuration % 60}s</span></div>
                  <input type="range" min={30} max={600} step={30} value={meetingDuration} onChange={(e) => setMeetingDuration(parseInt(e.target.value))} className="w-full h-2 bg-slate-900 rounded-lg accent-indigo-600 appearance-none" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><label className="text-xs font-bold text-slate-300 uppercase">Last Stand Window</label><span className="text-xs font-black text-indigo-400">{lastStandDuration}s</span></div>
                  <input type="range" min={5} max={30} step={5} value={lastStandDuration} onChange={(e) => setLastStandDuration(parseInt(e.target.value))} className="w-full h-2 bg-slate-900 rounded-lg accent-indigo-600 appearance-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">App Intel & Protocol</h4>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={handleShare} className="p-4 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 transition-all">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Share App</span>
                 </button>
                 <button onClick={() => setInfoModal({ title: "Privacy Protocol", content: "Confidentiality is our primary directive. This system runs locally on your neural link (device). No personal intelligence data is transmitted to external servers without authorization. Game data persists in your local storage core only." })} className="p-4 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 transition-all">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Privacy Policy</span>
                 </button>
                 <button onClick={() => setInfoModal({ title: "Terms of Engagement", content: "By initializing this engine, you agree to play fairly and uphold the spirit of the deduction game. Unauthorized tampering with the system parameters is discouraged. Have fun and may the best operative win." })} className="p-4 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 transition-all">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Terms of Service</span>
                 </button>
                 <button onClick={() => window.location.href = "mailto:feedback@imposterpurge.com?subject=Mission%20Report"} className="p-4 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 transition-all">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Send Feedback</span>
                 </button>
                 <button onClick={() => setInfoModal({ title: "VzLatte", content: "Designed and engineered by a solo Dev dedicated to creating immersive, high-stakes digital experiences. Uses Gemini AI and modern neural frameworks." })} className="p-4 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 transition-all">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">About Creator</span>
                 </button>
                 <div 
                   onClick={handleSecretTrigger}
                   className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 opacity-60 cursor-pointer active:scale-95 transition-all"
                 >
                    <span className="text-[8px] font-black uppercase text-slate-500">System Build</span>
                    <span className="text-[10px] font-black text-indigo-500">{APP_VERSION}</span>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button onClick={onBack} className="mt-auto w-full py-5 bg-slate-800 border-2 border-slate-700 rounded-3xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all shrink-0" >Return to Base</button>

      {/* Info Modal Overlay */}
      {infoModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
           <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] w-full max-sm p-8 shadow-2xl space-y-6 animate-in zoom-in duration-300">
              <div className="text-center space-y-2">
                 <h3 className="text-xl font-black uppercase tracking-tighter text-indigo-400">{infoModal.title}</h3>
                 <div className="w-12 h-1 bg-indigo-500/20 mx-auto rounded-full" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed text-center font-medium">
                {infoModal.content}
              </p>
              <button onClick={() => setInfoModal(null)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Close Protocol</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
