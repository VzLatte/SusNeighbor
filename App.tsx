
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, GameCategory, PowerUp, MainMode } from './types';
import { useGameState } from './hooks/useGameState';
import { soundService } from './services/soundService';

import Header from './components/Header';
import Setup from './components/Setup';
import RevealCard from './components/RevealCard';
import PassPhone from './components/PassPhone';
import Meeting from './components/Meeting';
import Voting from './components/Voting';
import LastStand from './components/LastStand';
import Results from './components/Results';
import Settings from './components/Settings';
import HelpGuide from './components/HelpGuide';
import Leaderboard from './components/Leaderboard';
import AuctionBidding from './components/AuctionBidding';
import VirusPurgeGuess from './components/VirusPurgeGuess';
import MimicGuess from './components/MimicGuess';

const DynamicBackground: React.FC = () => {
  // Generate some random floating particles
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    size: Math.random() * 150 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 20,
    delay: Math.random() * -20,
  }));

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020617]">
      {/* Moving Ambient Blobs */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full mix-blend-screen opacity-[0.07]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            // Fix: Use p.id since i is not in scope here. p.id was assigned the value of i during array mapping.
            background: p.id % 2 === 0 ? 'radial-gradient(circle, #4f46e5, transparent)' : 'radial-gradient(circle, #ec4899, transparent)',
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        />
      ))}

      {/* Techno Grid */}
      <div className="absolute inset-0" 
        style={{
          backgroundImage: `linear-gradient(rgba(79, 70, 229, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
          animation: 'backgroundMove 60s linear infinite'
        }} 
      />

      {/* Scanline Effect */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent"
        style={{ animation: 'scanline 12s ease-in-out infinite' }}
      />
      
      <style>{`
        @keyframes backgroundMove {
          from { background-position: 0 0; }
          to { background-position: 600px 600px; }
        }
        @keyframes scanline {
          0% { top: -10%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const game = useGameState();

  // Music Controller
  useEffect(() => {
    // Note: Browser audio policy usually requires a user interaction first.
    // Most users will click "Initialize Mission" or a mode button immediately.
    if (!game.musicEnabled) {
      soundService.stopBGM();
      return;
    }

    if (game.phase === 'HOME' || game.phase === 'SETUP' || game.phase === 'LEADERBOARD') {
      soundService.startBGM('MENU');
    } else if (game.phase === 'MEETING') {
      soundService.startBGM('MEETING');
    } else {
      soundService.stopBGM();
    }
  }, [game.phase, game.musicEnabled]);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {game.bgAnimationEnabled ? <DynamicBackground /> : <div className="fixed inset-0 z-0 bg-[#020617]" />}
      
      <div className="relative z-10 flex flex-col h-full flex-1">
        <Header 
          onSettings={() => game.setPhase('SETTINGS')} 
          onHelp={() => game.setPhase('HELP')} 
          onLeaderboard={() => game.setPhase('LEADERBOARD')} 
          showSettings={game.phase === 'HOME' || game.phase === 'SETUP'} 
          onHome={game.resetGame} 
        />
        
        <main className="flex-1 relative flex flex-col max-w-md mx-auto w-full p-6 overflow-y-auto custom-scrollbar">
          {game.isAiLoading && (
              <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6 text-center p-8 animate-in fade-in duration-300">
                  <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <div className="space-y-2">
                      <h3 className="text-xl font-black text-indigo-400 uppercase tracking-tighter">Syncing Mission Intel</h3>
                      <p className="text-slate-500 text-sm font-bold uppercase tracking-widest animate-pulse">Neural Link In Progress...</p>
                  </div>
              </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div 
              key={game.phase + (['REVEAL', 'REVEAL_TRANSITION'].includes(game.phase) ? game.currentPlayerIndex : '')} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className="flex-1 flex flex-col" 
            >
              {game.phase === 'HOME' && (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in zoom-in duration-500">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-3">
                        <span className="text-6xl font-black text-white">?</span>
                      </div>
                      <h2 className="text-4xl font-black tracking-tighter uppercase mt-6">
                        {game.gameCategory === GameCategory.PVE ? 'Virus Purge' : 'Imposter Purge'}
                      </h2>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Protocol Deduction Engine</p>
                    </div>
                    <div className="w-full space-y-4">
                      <div className="grid grid-cols-2 gap-2 bg-slate-900/50 backdrop-blur-sm p-1 rounded-2xl border border-slate-800">
                         <button onClick={() => { game.setGameCategory(GameCategory.PVP); soundService.playClick(); }} className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${game.gameCategory === GameCategory.PVP ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}> PvP (Competitive) </button>
                         <button onClick={() => { game.setGameCategory(GameCategory.PVE); soundService.playClick(); }} className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${game.gameCategory === GameCategory.PVE ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'text-slate-500 hover:text-slate-300'}`}> Co-op (PvE) </button>
                      </div>
                      <button onClick={() => { soundService.playClick(); game.setPhase('SETUP'); }} className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-2xl shadow-2xl border-b-4 border-indigo-900 active:scale-95 transition-all">INITIALIZE MISSION</button>
                      <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] animate-pulse">Status: Ready for Deployment</p>
                    </div>
                 </div>
              )}

              {game.phase === 'SETUP' && <Setup {...game} onStart={game.handleStart} />}

              {game.phase === 'AUCTION_REVEAL' && (
                <div className="flex-1 flex flex-col space-y-8">
                  <h2 className="text-3xl font-black text-yellow-500 text-center uppercase">Auction Phase</h2>
                  <div className="space-y-3">{game.gameContext?.availablePowers.map(p => <div key={p} className="p-4 bg-slate-800/80 backdrop-blur-sm border-2 border-slate-700 rounded-2xl flex justify-between items-center"><span className="font-black text-indigo-400">{p}</span></div>)}</div>
                  <button onClick={() => { soundService.playClick(); game.setPhase('AUCTION_TRANSITION'); }} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl">START BIDDING</button>
                </div>
              )}

              {(game.phase === 'AUCTION_TRANSITION' || game.phase === 'REVEAL_TRANSITION') && (
                <PassPhone nextPlayer={game.players[game.currentPlayerIndex]} onConfirm={() => game.setPhase(game.phase === 'AUCTION_TRANSITION' ? 'AUCTION_BIDDING' : 'REVEAL')} soundEnabled={game.soundEnabled} />
              )}

              {game.phase === 'AUCTION_BIDDING' && (
                <AuctionBidding player={game.players[game.currentPlayerIndex]} availablePowers={game.gameContext!.availablePowers} onComplete={(bid) => {
                  const updated = [...game.players];
                  const p = updated[game.currentPlayerIndex];
                  p.bidAmount = bid.amount; p.activePower = bid.power || undefined; p.activeRisk = bid.risk || undefined; p.credits -= bid.amount;
                  game.setPlayers(updated);
                  if (game.currentPlayerIndex < game.playerCount - 1) { game.setCurrentPlayerIndex(game.currentPlayerIndex + 1); game.setPhase('AUCTION_TRANSITION'); }
                  else { game.setCurrentPlayerIndex(0); game.setPhase('REVEAL_TRANSITION'); }
                }} />
              )}

              {game.phase === 'REVEAL' && (
                <RevealCard player={game.players[game.currentPlayerIndex]} gameMode={game.gameMode} mainMode={game.mainMode} soundEnabled={game.soundEnabled} context={game.gameContext!} onNext={() => { 
                    if (game.currentPlayerIndex < game.playerCount - 1) { game.setCurrentPlayerIndex(game.currentPlayerIndex + 1); game.setPhase('REVEAL_TRANSITION'); } 
                    else game.setPhase('STARTING_PLAYER_ANNOUNCEMENT'); 
                }} />
              )}

              {game.phase === 'STARTING_PLAYER_ANNOUNCEMENT' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                    <div className="text-center space-y-4">
                      <p className="text-slate-400 uppercase font-black text-[10px] tracking-widest">Discussion Initiated By:</p>
                      <div className="text-5xl font-black text-indigo-500 tracking-tighter">{game.gameContext?.startingPlayerName}</div>
                    </div>
                    <button onClick={() => game.setPhase('MEETING')} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-2xl shadow-xl border-b-4 border-indigo-900 active:scale-95 transition-all">OPEN COMMS</button>
                </div>
              )}

              {game.phase === 'MEETING' && <Meeting context={game.gameContext!} duration={game.meetingDuration} onTimerEnd={() => game.setPhase(game.gameCategory === GameCategory.PVE ? 'VIRUS_GUESS' : 'VOTING')} soundEnabled={game.soundEnabled} virusPoints={game.virusPoints} onDetection={game.handleDetectionTrigger} />}
              {game.phase === 'VOTING' && (
                <Voting 
                  players={game.players} 
                  onSelect={(selected) => { 
                    game.setLastEliminatedPlayer(selected); 
                    if (selected.role === Role.ANARCHIST) { 
                      game.setOutcome({ winner: 'ANARCHIST', reason: `${selected.name} was the Anarchist!` }); 
                      game.awardPoints('ANARCHIST', 'Anarchist win'); 
                      game.setPhase('RESULTS'); 
                    } 
                    else if (selected.role === Role.IMPOSTER) {
                      if (game.gameContext?.hasOracleActive) {
                        game.setPhase('LAST_STAND');
                      } else {
                        game.setOutcome({ winner: 'NEIGHBORS', reason: `${selected.name} was the Imposter! Neighbors secure the win.` });
                        game.awardPoints('NEIGHBORS', 'Threat removed');
                        game.setPhase('RESULTS');
                      }
                    }
                    else if (selected.role === Role.MR_WHITE) {
                      game.setPhase('LAST_STAND'); 
                    }
                    else { 
                      game.setOutcome({ winner: 'IMPOSTERS', reason: `Eliminated ${selected.name} (${selected.role}). Civilian error.` }); 
                      game.awardPoints('IMPOSTERS', 'Innocent out'); 
                      game.setPhase('RESULTS'); 
                    } 
                  }} 
                />
              )}
              {game.phase === 'LAST_STAND' && <LastStand player={game.lastEliminatedPlayer!} allPlayers={game.players} realProject={game.gameContext!.realProject} distractors={game.gameContext!.distractors} duration={game.lastStandDuration} mainMode={game.mainMode} onResult={(res) => { if (res === 'PROJECT_CORRECT' || res === 'ORACLE_CORRECT') game.setOutcome({ winner: 'IMPOSTERS', reason: 'Target identified.' }); else { game.setOutcome({ winner: 'NEIGHBORS', reason: 'Failed identification.' }); game.awardPoints('NEIGHBORS', 'Civ victory'); } game.setPhase('RESULTS'); }} soundEnabled={game.soundEnabled} hasOracleInPlay={game.gameContext!.hasOracleActive} />}
              {game.phase === 'MIMIC_GUESS' && <MimicGuess player={game.players.find(p => p.role === Role.MIMIC)!} allPlayers={game.players} imposters={game.players.filter(p => p.role === Role.IMPOSTER || p.role === Role.MR_WHITE)} realProject={game.gameContext!.realProject} distractors={game.gameContext!.distractors} mainMode={game.mainMode} soundEnabled={game.soundEnabled} onResult={(correct) => { if (correct) { game.setOutcome({ winner: 'MIMIC', reason: 'Rogue operative hijacked the mission!' }); game.awardPoints('MIMIC', 'Mimic steal'); } else { game.setOutcome({ winner: 'NEIGHBORS', reason: 'Rogue mimic failed their heist.' }); game.awardPoints('NEIGHBORS', 'Neighbors hold firm'); } game.setPhase('RESULTS'); }} />}
              {game.phase === 'VIRUS_GUESS' && <VirusPurgeGuess context={game.gameContext!} onResult={game.handleVirusGuess} soundEnabled={game.soundEnabled} />}
              {game.phase === 'RESULTS' && game.outcome && <Results outcome={game.outcome as any} players={game.players} allTimePoints={game.allTimePoints} onReset={game.resetGame} />}
              {game.phase === 'SETTINGS' && <Settings {...game} onBack={() => game.setPhase('SETUP')} onSave={(ns, ni, nw, nv) => { game.setScenarioSets(ns); game.setInquestSets(ni); game.setWordSets(nw); game.setVirusSets(nv); }} />}
              {game.phase === 'LEADERBOARD' && <Leaderboard points={game.allTimePoints} history={game.gameHistory} onBack={game.resetGame} onClear={game.clearStats} />}
              {game.phase === 'HELP' && <HelpGuide onBack={() => game.setPhase('SETUP')} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
