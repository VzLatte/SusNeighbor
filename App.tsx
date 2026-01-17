
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


const NotificationToast: React.FC<{ notification: { message: string, type: 'error' | 'info' | 'warning' }, onClose: () => void }> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgStyles = {
    error: 'bg-red-600/90 border-red-500',
    warning: 'bg-amber-600/90 border-amber-500',
    info: 'bg-indigo-600/90 border-indigo-500'
  };

  const icons = { error: '✕', warning: '⚠', info: 'ℹ' };

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={`fixed bottom-6 left-6 right-6 z-[200] max-w-sm mx-auto p-4 rounded-2xl border-2 backdrop-blur-md shadow-2xl flex items-start gap-3 ${bgStyles[notification.type]}`} >
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-black text-sm">{icons[notification.type]}</div>
      <div className="flex-1 text-xs font-black uppercase tracking-tight text-white leading-tight">{notification.message}</div>
      <button onClick={onClose} className="text-white/60 hover:text-white font-black px-1">✕</button>
    </motion.div>
  );
};

const DynamicBackground: React.FC = () => {
  const particles = Array.from({ length: 12 }).map((_, i) => ({ id: i, size: Math.random() * 300 + 200, x: Math.random() * 100, y: Math.random() * 100, duration: Math.random() * 20 + 20, delay: Math.random() * -20 }));
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#01030a]">
      <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(79, 70, 229, 0.4) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(79, 70, 229, 0.4) 1.5px, transparent 1.5px), linear-gradient(rgba(79, 70, 229, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, 0.1) 1px, transparent 1px)`, backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px', maskImage: 'radial-gradient(ellipse at center, black, transparent 95%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 95%)', animation: 'backgroundMove 120s linear infinite' }} />
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full mix-blend-screen opacity-[0.12]" style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, background: p.id % 2 === 0 ? 'radial-gradient(circle, rgba(79, 70, 229, 0.8), transparent 70%)' : 'radial-gradient(circle, rgba(236, 72, 153, 0.8), transparent 70%)', filter: 'blur(80px)' }} animate={{ x: [0, 100, -100, 0], y: [0, -100, 100, 0], scale: [1, 1.2, 0.8, 1] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#01040f] via-transparent to-[#01040f] opacity-80" />
      <style>{`@keyframes backgroundMove { from { background-position: 0 0; } to { background-position: 800px 800px; } }`}</style>
    </div>
  );
};

const App: React.FC = () => {
  const game = useGameState();

  useEffect(() => {
    if (!game.musicEnabled) { soundService.stopBGM(); return; }
    if (soundService.getBGMType() === 'SECRET') return;
    const menuPhases = ['HOME', 'SETUP', 'LEADERBOARD', 'SETTINGS', 'HELP', 'REVEAL_TRANSITION', 'REVEAL', 'AUCTION_REVEAL', 'AUCTION_TRANSITION', 'AUCTION_BIDDING', 'STARTING_PLAYER_ANNOUNCEMENT'];
    if (menuPhases.includes(game.phase)) { soundService.startBGM('MENU'); } else if (game.phase === 'MEETING') { soundService.startBGM('MEETING'); } else { soundService.stopBGM(); }
  }, [game.phase, game.musicEnabled]);

  const handleLastStandResult = (result: 'PROJECT_CORRECT' | 'PROJECT_WRONG' | 'ORACLE_CORRECT' | 'ORACLE_WRONG') => {
    const player = game.lastEliminatedPlayer;
    if (!player || !game.gameContext) return;

    if (result === 'PROJECT_CORRECT') {
      if (player.role === Role.BOUNTY_HUNTER) {
         game.setOutcome({ winner: 'NEIGHBORS', reason: `${player.name} (Bounty Hunter) proved their innocence by stating the word! Neighbors Win.` });
         game.awardPoints('NEIGHBORS', 'Bounty Hunter Redemption');
      } else {
         game.setOutcome({ winner: 'IMPOSTERS', reason: `${player.name} guessed the project! Security compromised.` });
         game.awardPoints('IMPOSTERS', 'Last Stand Victory');
      }
    } else if (result === 'ORACLE_CORRECT') {
      game.setOutcome({ winner: 'IMPOSTERS', reason: `${player.name} identified the Oracle! Network exposed.` });
      game.awardPoints('IMPOSTERS', 'Oracle Assassination');
    } else {
      if (player.role === Role.BOUNTY_HUNTER) {
         game.setOutcome({ winner: 'IMPOSTERS', reason: `Neighbors voted out ${player.name} (Bounty Hunter) and they failed to prove identity.` });
         game.awardPoints('IMPOSTERS', 'Civilian Eliminated');
      } else {
         game.setOutcome({ winner: 'NEIGHBORS', reason: `${player.name} failed to intercept intel. Neighbors Secure.` });
         game.awardPoints('NEIGHBORS', 'Threat Eliminated');
      }
    }
    game.setPhase('RESULTS');
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {game.bgAnimationEnabled ? <DynamicBackground /> : <div className="fixed inset-0 z-0 bg-[#020617]" />}
      <div className="relative z-10 flex flex-col h-full flex-1">
        <Header onSettings={() => game.setPhase('SETTINGS')} onHelp={() => game.setPhase('HELP')} onLeaderboard={() => game.setPhase('LEADERBOARD')} showSettings={game.phase === 'HOME' || game.phase === 'SETUP'} onHome={game.resetGame} />
        <main className="flex-1 relative flex flex-col max-w-md mx-auto w-full p-6 overflow-y-auto custom-scrollbar">
          <AnimatePresence>{game.notification && ( <NotificationToast notification={game.notification} onClose={() => game.setNotification(null)} /> )}</AnimatePresence>
          <AnimatePresence>{game.isAiLoading && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6 text-center p-8" > <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /> <h3 className="text-xl font-black text-indigo-400 uppercase tracking-tighter">Syncing Mission Intel</h3> </motion.div> )}</AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div key={game.phase + (['REVEAL', 'REVEAL_TRANSITION'].includes(game.phase) ? game.currentPlayerIndex : '')} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col" >
              {game.phase === 'HOME' && (
                 <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in zoom-in duration-500">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-3"><span className="text-6xl font-black text-white">?</span></div>
                      <h2 className="text-4xl font-black tracking-tighter uppercase mt-6">{game.gameCategory === GameCategory.PVE ? 'Virus Purge' : 'Imposter Purge'}</h2>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Protocol Deduction Engine</p>
                    </div>
                    <div className="w-full space-y-4">
                      <div className="grid grid-cols-2 gap-2 bg-slate-900/50 backdrop-blur-sm p-1 rounded-2xl border border-slate-800">
                         <button onClick={() => { game.setGameCategory(GameCategory.PVP); soundService.playClick(); }} className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${game.gameCategory === GameCategory.PVP ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}> PvP </button>
                         <button onClick={() => { game.setGameCategory(GameCategory.PVE); soundService.playClick(); }} className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${game.gameCategory === GameCategory.PVE ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'text-slate-500 hover:text-slate-300'}`}> Co-op </button>
                      </div>
                      <button onClick={() => { soundService.playClick(); game.setPhase('SETUP'); }} className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-2xl shadow-2xl border-b-4 border-indigo-900 active:scale-95 transition-all">INITIALIZE MISSION</button>
                    </div>
                 </div>
              )}
              {game.phase === 'SETUP' && <Setup {...game} onStart={game.handleStart} />}
              {(game.phase === 'AUCTION_TRANSITION' || game.phase === 'REVEAL_TRANSITION') && game.gameContext && ( <PassPhone nextPlayer={game.players[game.currentPlayerIndex]} onConfirm={() => game.setPhase(game.phase === 'AUCTION_TRANSITION' ? 'AUCTION_BIDDING' : 'REVEAL')} soundEnabled={game.soundEnabled} /> )}
              {game.phase === 'AUCTION_BIDDING' && game.gameContext && ( <AuctionBidding player={game.players[game.currentPlayerIndex]} availablePowers={game.gameContext.availablePowers} onComplete={(bid) => { const updated = [...game.players]; const p = updated[game.currentPlayerIndex]; p.bidAmount = bid.amount; p.activePower = bid.power || undefined; p.activeRisk = bid.risk || undefined; p.credits -= bid.amount; game.setPlayers(updated); if (game.currentPlayerIndex < game.playerCount - 1) { game.setCurrentPlayerIndex(game.currentPlayerIndex + 1); game.setPhase('AUCTION_TRANSITION'); } else { game.setCurrentPlayerIndex(0); game.setPhase('REVEAL_TRANSITION'); } }} /> )}
              {game.phase === 'REVEAL' && game.gameContext && ( <RevealCard player={game.players[game.currentPlayerIndex]} gameMode={game.gameMode} mainMode={game.mainMode} soundEnabled={game.soundEnabled} slotMachineEnabled={game.slotMachineEnabled} activeRoles={game.activeRolesInPlay} context={game.gameContext} onNext={() => { if (game.currentPlayerIndex < game.playerCount - 1) { game.setCurrentPlayerIndex(game.currentPlayerIndex + 1); game.setPhase('REVEAL_TRANSITION'); } else game.setPhase('STARTING_PLAYER_ANNOUNCEMENT'); }} /> )}
              {game.phase === 'STARTING_PLAYER_ANNOUNCEMENT' && game.gameContext && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                    <div className="text-center space-y-4">
                      <p className="text-slate-400 uppercase font-black text-[10px] tracking-widest">Discussion Initiated By:</p>
                      <div className="text-5xl font-black text-indigo-500 tracking-tighter">{game.gameContext.startingPlayerName}</div>
                      {game.gameContext.evilTeamCount !== undefined && ( <div className="mt-4 p-3 bg-pink-900/20 border border-pink-500/30 rounded-2xl inline-block"> <p className="text-[10px] font-black uppercase text-pink-500 tracking-widest">Imposter Team Count</p> <p className="text-2xl font-black text-white">{game.gameContext.evilTeamCount}</p> </div> )}
                    </div>
                    <button onClick={() => game.setPhase('MEETING')} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-2xl shadow-xl border-b-4 border-indigo-900 active:scale-95 transition-all">OPEN COMMS</button>
                </div>
              )}
              {game.phase === 'MEETING' && game.gameContext && <Meeting context={game.gameContext} duration={game.meetingDuration} onTimerEnd={() => game.setPhase(game.gameCategory === GameCategory.PVE ? 'VIRUS_GUESS' : 'VOTING')} soundEnabled={game.soundEnabled} virusPoints={game.virusPoints} onDetection={game.handleDetectionTrigger} />}
              {game.phase === 'VOTING' && ( 
                <Voting 
                  players={game.players} 
                  soundEnabled={game.soundEnabled} 
                  onSelect={(selected) => { 
                    game.setLastEliminatedPlayer(selected); 
                    if (selected.role === Role.ANARCHIST) { 
                      game.setOutcome({ winner: 'ANARCHIST', reason: `${selected.name} was the Anarchist! Rogue victory.` }); 
                      game.awardPoints('ANARCHIST', 'Anarchist win'); 
                      game.setPhase('RESULTS'); 
                    } else if ([Role.IMPOSTER, Role.MR_WHITE, Role.BOUNTY_HUNTER].includes(selected.role)) { 
                      // These roles trigger Last Stand
                      game.setPhase('LAST_STAND');
                    } else if (selected.role === Role.MIMIC) {
                      game.setOutcome({ winner: 'NEIGHBORS', reason: `The Mimic (${selected.name}) was caught! Neighbors win.` }); 
                      game.awardPoints('NEIGHBORS', 'Mimic Caught'); 
                      game.setPhase('RESULTS'); 
                    } else { 
                      game.setOutcome({ winner: 'IMPOSTERS', reason: `Eliminated ${selected.name} (Innocent). Surveillance failure.` }); 
                      game.awardPoints('IMPOSTERS', 'Innocent out'); 
                      game.setPhase('RESULTS'); 
                    } 
                  }} 
                /> 
              )}
              {game.phase === 'LAST_STAND' && game.lastEliminatedPlayer && game.gameContext && (
                 <LastStand 
                    player={game.lastEliminatedPlayer}
                    allPlayers={game.players}
                    realProject={game.gameContext.realProject}
                    distractors={game.gameContext.distractors}
                    mainMode={game.mainMode}
                    duration={game.lastStandDuration}
                    soundEnabled={game.soundEnabled}
                    hasOracleInPlay={game.gameContext.hasOracleActive}
                    onResult={handleLastStandResult}
                 />
              )}
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
