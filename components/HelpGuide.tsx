import React, { useState } from 'react';

interface HelpGuideProps {
  onBack: () => void;
}

const HelpGuide: React.FC<HelpGuideProps> = ({ onBack }) => {
  const [activeManual, setActiveManual] = useState<'PVP' | 'PVE'>('PVP');

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in slide-in-from-right duration-300 pb-20">
      <div className="text-center shrink-0">
        <h2 className="text-3xl font-black text-indigo-400 uppercase tracking-tighter">Field Manual</h2>
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Standard Operating Procedures</p>
      </div>

      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shrink-0">
        <button 
          onClick={() => setActiveManual('PVP')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeManual === 'PVP' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}
        > Competitive </button>
        <button 
          onClick={() => setActiveManual('PVE')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeManual === 'PVE' ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'text-slate-500'}`}
        > Co-operative </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
        {activeManual === 'PVP' ? (
          <div className="space-y-8">
            <section className="space-y-3">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">1. The Objective</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A high-stakes social deduction mission with refined roles. Each role has unique abilities creating complex strategic gameplay.

                2. Role System
                <span className="text-indigo-400 font-bold">Good Team:</span>
                • <span className="text-blue-400 font-bold">Neighbor</span>: Pure deduction, protects the real project
                • <span className="text-yellow-400 font-bold">Hunter</span>: Investigates alignment once per game, no word knowledge
                • <span className="text-teal-400 font-bold">Seer</span>: Receives cryptic clues, not exact answers

                <span className="text-red-400 font-bold">Evil Team:</span>
                • <span className="text-red-400 font-bold">Imposter</span>: Knows the fake project, must blend in
                • <span className="text-gray-400 font-bold">Mr. White</span>: No word knowledge, pure social deception

                <span className="text-orange-400 font-bold">Saboteur</span>: Chaos agent with multiple win conditions

                <span className="text-purple-400 font-bold">Mercenary</span>: True neutral, sees one player's word, chooses side

                3. Game Modes
                <span className="text-indigo-400 font-bold">PvP (Competitive)</span>: Standard competitive gameplay
                <span className="text-teal-400 font-bold">PvE (Co-operative)</span>: Team-based virus purge missions

                4. Strategic Depth
                Each role creates unique information asymmetry and requires different playstyles:
                - **Information Hierarchy**: Neighbor {'>'} Hunter {'>'} Seer {'>'} Imposter {'>'} Mr. White
                - **Counterplay**: Every ability has built-in weaknesses and counter-strategies
                - **Skill Expression**: Good players excel at deduction; evil players excel at deception
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">2. PvP Mechanics</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Phase 1: Briefing</h4>
                  <p className="text-[11px] text-slate-400">Pass the phone around. Swipe up to read your role and secret word. Keep it hidden from others!</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Phase 2: Town Meeting</h4>
                  <p className="text-[11px] text-slate-400">Discussion starts with the Lead Speaker. Describe your word/project using one word or phrase. Vague enough to hide, clear enough for allies.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Phase 3: The Vote</h4>
                  <p className="text-[11px] text-slate-400">Discuss suspicions. Simultaneously point at the suspect. The player with the most votes is eliminated. Ties mean no elimination.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Phase 4: Last Stand</h4>
                  <p className="text-[11px] text-slate-400">Eliminated Mr. White get one chance to intercept the project word. If they guess it, they steal the victory!</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">3. Detailed Roles</h3>
              <div className="space-y-4">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Neighbor</span>
                  <p className="text-[11px] mt-1 text-slate-300">Knows the Real Word. Protect it. <br/><span className="text-green-500 font-bold">Win:</span> Catch all Imposters and survive their Last Stand.</p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-pink-500">Imposter</span>
                  <p className="text-[11px] mt-1 text-slate-300">Receives a decoy word. Blend in. <br/><span className="text-green-500 font-bold">Win:</span> Outnumber Neighbors or not chosen if caught.</p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-yellow-500">Mr. White</span>
                  <p className="text-[11px] mt-1 text-slate-300">Has NO word. Listen to clues and fake it. <br/><span className="text-green-500 font-bold">Win:</span> Stay hidden or guess the Real Word if voted out.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">4. Mission Variants</h3>
              <div className="space-y-3">
                 <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-white uppercase">Terms (Classic)</h4>
                   <p className="text-[11px] text-slate-400">Direct word pairs like "Coffee" vs "Tea". Quick, verbal, and deadly.</p>
                 </div>
                 <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-white uppercase">Scheme (Location)</h4>
                   <p className="text-[11px] text-slate-400">Everyone knows a Location (e.g., "Airport"). Neighbors have a specific project (e.g., "Duty Free Shop") while Special Roles guess.</p>
                 </div>
                 <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-white uppercase">Inquest (Structured)</h4>
                   <p className="text-[11px] text-slate-400">Structured questioning. 3 specific questions with multiple choice answers. Harder to bluff!</p>
                 </div>
                 <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-white uppercase">Investment (Resources)</h4>
                   <p className="text-[11px] text-slate-400">Allocate 10 points across categories (Safety, Tech, etc). Discrepancies reveal the Imposter's false priorities.</p>
                 </div>
                 <div className="space-y-1">
                   <h4 className="text-[10px] font-black text-white uppercase">Pair (Chained)</h4>
                   <p className="text-[11px] text-slate-400">Circular intel chain. You see your own word AND your neighbor's word. Find where the chain is broken.</p>
                 </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">5. Protocol Modifiers</h3>
              <div className="space-y-3">
                 <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                   <span className="text-[10px] font-black text-indigo-400 uppercase">Mysterious Mode</span>
                   <p className="text-[11px] text-slate-400 mt-1">Traitor blindness. Imposters believe they are Neighbors until the descriptions stop matching.</p>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                   <span className="text-[10px] font-black text-purple-400 uppercase">Taboo Mode</span>
                   <p className="text-[11px] text-slate-400 mt-1">Restricted vocabulary. A random rule (e.g., "No verbs") applies to all Neighbors.</p>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                   <span className="text-[10px] font-black text-yellow-500 uppercase">Auction & Powers</span>
                   <p className="text-[11px] text-slate-400 mt-1">Bid earned credits for tactical tech: Polygraphs, Double Votes, Vetoes, and more.</p>
                 </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            <section className="space-y-3">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">1. 🦠 The Virus Purge</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Phone acts as a <span className="text-pink-500 font-black">Malicious Virus</span>. There are no traitors among you. All players are <span className="text-teal-400 font-bold">Civilians</span> on the same team.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">2. Core Gameplay</h3>
              <div className="space-y-3">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-black uppercase text-teal-500">The Target Word</span>
                  <p className="text-[11px] mt-1 text-slate-300">Everyone sees the same word (e.g., "Library"). Describe it to confirm your team's integrity.</p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-black uppercase text-pink-500">Detection Noise</span>
                  <p className="text-[11px] mt-1 text-slate-300">The system generates 3 words associated with a hidden virus. If your description accidentally matches these, the virus gains a point.</p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-black uppercase text-white">The Purge Guess</span>
                  <p className="text-[11px] mt-1 text-slate-300">After the rounds, you must look at the noise words and guess the hidden Virus word. Correct guess wins the game!</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">3. Co-op Victory</h3>
              <div className="p-4 bg-teal-900/20 border border-teal-500/30 rounded-2xl">
                 <p className="text-xs text-teal-400 font-black text-center italic">"Isolate the Virus. Guess the Code. Save the System."</p>
                 <ul className="text-[10px] text-slate-400 mt-3 list-disc pl-4 space-y-1">
                    <li>3 Detection Points = Game Over (Virus Wins)</li>
                    <li>Successful Word Guess = Team Victory</li>
                 </ul>
              </div>
            </section>
          </div>
        )}
      </div>

      <button onClick={onBack} className="mt-auto w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all shrink-0" > DISMISS BRIEFING </button>
    </div>
  );
};

export default HelpGuide;