
import { useState, useEffect, useCallback } from 'react';
import { 
  GamePhase, Player, Role, GameMode, MainMode, GroupMode, 
  GameContext, ScenarioSet, WordSet, InquestSet, 
  HistoryEntry, RoleDistributionMode, CustomRoleConfig, PowerUp, RiskContract, GameCategory, VirusSet, MeetingTimerSettings 
} from '../types';
import { 
  DEFAULT_SET, DEFAULT_WORD_SETS, DEFAULT_INQUEST_SET, VIRUS_WORDS_SET,
  INITIAL_PLAYER_COUNT, TABOO_CONSTRAINTS, MAX_PLAYERS
} from '../constants';
import { generateScenarioContext, generateVirusNoiseWords, generateAIPrompt } from '../services/geminiService';
import { soundService } from '../services/soundService';

export const useGameState = () => {
  const POINTS_KEY = 'imposter_points';
  const HISTORY_KEY = 'imposter_history';
  const SETTINGS_KEY = 'imposter_settings';

  const [phase, setPhase] = useState<GamePhase>('HOME');
  const [gameCategory, setGameCategory] = useState<GameCategory>(GameCategory.PVP);
  const [playerCount, setPlayerCount] = useState(INITIAL_PLAYER_COUNT);
  const [playerNames, setPlayerNames] = useState<string[]>(Array.from({ length: MAX_PLAYERS }, (_, i) => `Agent ${i + 1}`));
  const [imposterCount, setImposterCount] = useState(1);
  const [hasMrWhite, setHasMrWhite] = useState(false);
  const [includeHints, setIncludeHints] = useState(true);
  const [includeTaboo, setIncludeTaboo] = useState(false);
  const [isAuctionActive, setIsAuctionActive] = useState(false);
  const [isBlindBidding, setIsBlindBidding] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.NORMAL);
  const [groupMode, setGroupMode] = useState<GroupMode>(GroupMode.CLASSIC);
  const [mainMode, setMainMode] = useState<MainMode>(MainMode.TERMS);
  const [useAiMissions, setUseAiMissions] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'error' | 'info' | 'warning' } | null>(null);

  const [roleDistributionMode, setRoleDistributionMode] = useState<RoleDistributionMode>(RoleDistributionMode.STANDARD);
  const [customRoleConfig, setCustomRoleConfig] = useState<CustomRoleConfig>({
    neighborCount: 3,
    imposterCount: 1,
    specialCount: 1,
    minImposters: 1,
    maxImposters: 2,
    minSpecials: 0,
    maxSpecials: 1
  });

  const [scenarioSets, setScenarioSets] = useState<ScenarioSet[]>([DEFAULT_SET]);
  const [activeSetIds, setActiveSetIds] = useState<string[]>(['default']);
  const [wordSets, setWordSets] = useState<WordSet[]>(DEFAULT_WORD_SETS);
  const [activeWordSetIds, setActiveWordSetIds] = useState<string[]>(['default-words']);
  const [inquestSets, setInquestSets] = useState<InquestSet[]>([DEFAULT_INQUEST_SET]);
  const [activeInquestSetIds, setActiveInquestSetIds] = useState<string[]>(['default-inquest']);
  const [virusSets, setVirusSets] = useState<VirusSet[]>([VIRUS_WORDS_SET]);
  const [activeVirusSetIds, setActiveVirusSetIds] = useState<string[]>(['virus-default']);

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameContext, setGameContext] = useState<GameContext | null>(null);
  const [outcome, setOutcome] = useState<{ winner: string, reason: string } | null>(null);
  const [virusPoints, setVirusPoints] = useState(0);
  const [lastEliminatedPlayer, setLastEliminatedPlayer] = useState<Player | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [bgAnimationEnabled, setBgAnimationEnabled] = useState(true);
  const [slotMachineEnabled, setSlotMachineEnabled] = useState(true);
  const [requireRememberConfirmation, setRequireRememberConfirmation] = useState(true);
  const defaultMeetingTimers: MeetingTimerSettings = {
    round1Duration: 90,
    round2Duration: 60,
    round3Duration: 45
  };
  const [meetingDuration, setMeetingDuration] = useState(120);
  const [meetingTimerSettings, setMeetingTimerSettings] = useState<MeetingTimerSettings>(defaultMeetingTimers);
  const [lastStandDuration, setLastStandDuration] = useState(10);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSoundEnabled(parsed.soundEnabled ?? true);
        setMusicEnabled(parsed.musicEnabled ?? true);
        setMusicVolume(parsed.musicVolume ?? 0.5);
        setBgAnimationEnabled(parsed.bgAnimationEnabled ?? true);
        setSlotMachineEnabled(parsed.slotMachineEnabled ?? true);
        setRequireRememberConfirmation(parsed.requireRememberConfirmation ?? true);
        setMeetingDuration(parsed.meetingDuration ?? 120);
        setMeetingTimerSettings(parsed.meetingTimerSettings ?? defaultMeetingTimers);
        setLastStandDuration(parsed.lastStandDuration ?? 10);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      soundEnabled, musicEnabled, musicVolume, bgAnimationEnabled, slotMachineEnabled, 
      requireRememberConfirmation, meetingDuration, lastStandDuration, meetingTimerSettings
    }));
  }, [soundEnabled, musicEnabled, musicVolume, bgAnimationEnabled, slotMachineEnabled, requireRememberConfirmation, meetingDuration, lastStandDuration, meetingTimerSettings]);

  useEffect(() => {
    soundService.setBGMVolume(musicVolume);
  }, [musicVolume]);

  const [allTimePoints, setAllTimePoints] = useState<{ [name: string]: number }>(() => {
    try {
      const saved = localStorage.getItem(POINTS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [gameHistory, setGameHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [playerCredits, setPlayerCredits] = useState<{ [name: string]: number }>({});

  useEffect(() => {
    const maxImposters = Math.floor(playerCount / 2);
    if (imposterCount > maxImposters) {
      setImposterCount(Math.max(1, maxImposters));
    }
    
    setCustomRoleConfig(prev => {
      const newImposterCount = Math.min(prev.imposterCount, maxImposters);
      const remainingForSpecials = Math.max(0, playerCount - newImposterCount - 1); 
      const newSpecialCount = Math.min(prev.specialCount, remainingForSpecials);
      const newNeighborCount = playerCount - newImposterCount - newSpecialCount;
      
      return {
        ...prev,
        imposterCount: newImposterCount,
        specialCount: newSpecialCount,
        neighborCount: newNeighborCount,
        maxImposters: Math.min(prev.maxImposters, maxImposters),
        minImposters: Math.min(prev.minImposters, Math.min(prev.maxImposters, maxImposters)),
        maxSpecials: Math.min(prev.maxSpecials, playerCount - 2),
        minSpecials: Math.min(prev.minSpecials, Math.min(prev.maxSpecials, playerCount - 2))
      };
    });
  }, [playerCount]);

  useEffect(() => {
    localStorage.setItem(POINTS_KEY, JSON.stringify(allTimePoints));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(gameHistory));
  }, [allTimePoints, gameHistory]);

  const clearStats = useCallback(() => {
    localStorage.removeItem(POINTS_KEY);
    localStorage.removeItem(HISTORY_KEY);
    setAllTimePoints({});
    setGameHistory([]);
    setPlayerCredits({});
  }, [POINTS_KEY, HISTORY_KEY]);

  const awardPoints = useCallback((winner: string, reason: string) => {
    const newPoints = { ...allTimePoints };
    const newCredits = { ...playerCredits };
    const historyEntry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      winner: winner as any,
      reason,
      mode: mainMode,
      players: players.map(p => ({ name: p.name, role: p.role }))
    };

    players.forEach(p => {
      let won = false;
      let score = 10;
      const isImposterTeam = p.role === Role.IMPOSTER || p.role === Role.MR_WHITE;
      const isNeighborTeam = p.role === Role.NEIGHBOR;

      if (winner === 'NEIGHBORS' && isNeighborTeam) won = true;
      if (winner === 'IMPOSTERS' && isImposterTeam) {
        won = true;
        if (p.role === Role.IMPOSTER && !includeHints) score = 20; 
      }
      if (winner === 'HUMANS') won = true;

      if (won) {
        newPoints[p.name] = (newPoints[p.name] || 0) + score;
        if (p.activeRisk === RiskContract.VERBOSE) newCredits[p.name] = (newCredits[p.name] || 0) + 3;
        if (p.activeRisk === RiskContract.MINIMALIST) newCredits[p.name] = (newCredits[p.name] || 0) + 2;
        if (p.activeRisk === RiskContract.TARGET) newCredits[p.name] = (newCredits[p.name] || 0) + 4;
      }
    });

    setAllTimePoints(newPoints);
    setPlayerCredits(newCredits);
    setGameHistory(prev => [historyEntry, ...prev].slice(0, 50));
  }, [allTimePoints, players, playerCredits, mainMode, includeHints]);

  const handleStart = async () => {
    setNotification(null);
    if (soundEnabled) soundService.playTransition();
    setIsAiLoading(true);

    try {
      const initialCredits = { ...playerCredits };
      playerNames.slice(0, playerCount).forEach(name => {
        if (initialCredits[name] === undefined) initialCredits[name] = 10;
      });
      setPlayerCredits(initialCredits);

      if (gameCategory === GameCategory.PVE) {
        let virusWord = "";
        let realWord = "";
        let noiseWords: string[] = ["System", "Code", "Breach"]; 
        let category = "Co-op Core";

        if (useAiMissions) {
          try {
            const aiPrompt = await generateAIPrompt(MainMode.VIRUS_PURGE);
            if (aiPrompt) {
              virusWord = aiPrompt.virusWord;
              realWord = aiPrompt.realWord;
              category = "AI Network Purge";
              const noiseData = await generateVirusNoiseWords(realWord, virusWord);
              if (noiseData?.noiseWords) noiseWords = noiseData.noiseWords;
            } else throw new Error("AI Failure");
          } catch (e: any) {
            const vs = virusSets[0];
            virusWord = vs.words[Math.floor(Math.random() * vs.words.length)];
            realWord = wordSets[0].pairs[0].wordA;
            category = wordSets[0].name;
          }
        } else {
          const vs = virusSets.find(s => activeVirusSetIds.includes(s.id)) || virusSets[0];
          virusWord = vs.words[Math.floor(Math.random() * vs.words.length)];
          const ws = wordSets.find(s => activeWordSetIds.includes(s.id)) || wordSets[0];
          realWord = ws.pairs[Math.floor(Math.random() * ws.pairs.length)].wordA;
          category = ws.name;
        }

        const context: GameContext = {
          mainMode: MainMode.VIRUS_PURGE,
          realProject: realWord,
          virusWord,
          noiseWords,
          location: 'Secure Uplink',
          category,
          imposterProject: 'THREAT_DETECTED',
          distractors: [],
          includeHints: true,
          hasOracleActive: false,
          isAuctionActive: false,
          isBlindBidding: false,
          availablePowers: [],
          startingPlayerName: playerNames[Math.floor(Math.random() * playerCount)],
          evilTeamCount: 0
        };

        setGameContext(context);
        setPlayers(Array.from({ length: playerCount }).map((_, i) => ({
          id: `p-${i + 1}`,
          name: playerNames[i],
          role: Role.NEIGHBOR,
          assignedProject: realWord,
          inquestAnswers: [],
          credits: initialCredits[playerNames[i]] || 10
        })));
        setVirusPoints(0);
        setCurrentPlayerIndex(0);
        setPhase('REVEAL_TRANSITION');
        return;
      }

      const roles: Role[] = [];
      for (let i = 0; i < imposterCount; i++) roles.push(Role.IMPOSTER);
      
      if (roleDistributionMode === RoleDistributionMode.STANDARD) {
        if (hasMrWhite) roles.push(Role.MR_WHITE);
      } else {
        const specialPool = [Role.MR_WHITE].filter(r => {
          if (r === Role.MR_WHITE) return hasMrWhite;
          return false;
        });
        const { specialCount } = customRoleConfig;
        for(let i=0; i<specialCount; i++) {
          if (specialPool.length > 0) roles.push(specialPool[Math.floor(Math.random() * specialPool.length)]);
        }
      }

      while (roles.length < playerCount) roles.push(Role.NEIGHBOR);
      const shuffledRoles = [...roles].slice(0, playerCount).sort(() => Math.random() - 0.5);
      
      const availablePowers = Object.values(PowerUp).sort(() => Math.random() - 0.5).slice(0, 3);
      let wordA = "Coffee", wordB = "Tea", location = "Terms Office", realProject = "Coffee", catchRule = "No sugar", category = "Unclassified";
      let distractors: string[] = ["Library", "Park", "Gym"], imposterProject = "Tea";

      if (useAiMissions) {
        try {
          const aiPrompt = await generateAIPrompt(mainMode);
          if (aiPrompt) {
            if (mainMode === MainMode.TERMS || mainMode === MainMode.PAIR) {
              wordA = aiPrompt?.wordA || wordA; wordB = aiPrompt?.wordB || wordB;
              realProject = wordA; imposterProject = wordB; category = "Neural Retrieval";
            } else {
              realProject = aiPrompt?.project || realProject; location = aiPrompt?.location || location;
              catchRule = aiPrompt?.catch || catchRule; category = "Strategic Ops";
            }
          }
        } catch (e: any) {}
      } else {
        if (mainMode === MainMode.TERMS || mainMode === MainMode.PAIR) {
          const activeSets = wordSets.filter(s => activeWordSetIds.includes(s.id));
          const randomSet = activeSets[Math.floor(Math.random() * activeSets.length)] || wordSets[0];
          const pair = randomSet.pairs[Math.floor(Math.random() * randomSet.pairs.length)];
          wordA = pair.wordA; wordB = pair.wordB; realProject = wordA; imposterProject = wordB; category = randomSet.name;
        } else {
          const activeSets = scenarioSets.filter(s => activeSetIds.includes(s.id));
          const randomSet = activeSets[Math.floor(Math.random() * activeSets.length)] || scenarioSets[0];
          realProject = randomSet.projects[Math.floor(Math.random() * randomSet.projects.length)];
          location = randomSet.locations[Math.floor(Math.random() * randomSet.locations.length)];
          catchRule = randomSet.catches[Math.floor(Math.random() * randomSet.catches.length)];
          category = randomSet.name;
        }
      }

      const evilRoles = [Role.IMPOSTER, Role.MR_WHITE];
      const evilTeamCount = shuffledRoles.filter(r => evilRoles.includes(r)).length;

      let context: GameContext = {
        mainMode, realProject, location, category, catchRule, 
        imposterProject: includeHints ? imposterProject : '???', 
        distractors: [], includeHints, 
        hasOracleActive: false, 
        isAuctionActive, isBlindBidding, availablePowers, evilTeamCount
      };

      if (mainMode === MainMode.PAIR) {
        const pool = [wordA, wordB, "Sugar", "Milk", "Honey"];
        context.dualWordsChain = Array.from({length: playerCount}).map((_, i) => pool[i % pool.length]);
        context.realProject = context.dualWordsChain[0];
      }

      const finalPlayers: Player[] = shuffledRoles.map((role, i) => {
        let p1 = '', p2 = undefined;
        if (mainMode === MainMode.PAIR) {
          const prevIdx = (i - 1 + playerCount) % playerCount;
          if ([Role.IMPOSTER, Role.MR_WHITE].includes(role)) { p1 = "???"; p2 = "???"; }
          else { p1 = context.dualWordsChain![prevIdx]; p2 = context.dualWordsChain![i]; }
        } else {
          if ([Role.NEIGHBOR].includes(role)) p1 = context.realProject;
          else if (role === Role.IMPOSTER) p1 = context.imposterProject;
          else p1 = '???';
        }
        return { id: `p-${i + 1}`, name: playerNames[i], role, assignedProject: p1, assignedProject2: p2, inquestAnswers: [], credits: initialCredits[playerNames[i]] || 10 };
      });

      context.startingPlayerName = finalPlayers[Math.floor(Math.random() * finalPlayers.length)].name;
      setGameContext(context); setPlayers(finalPlayers); setCurrentPlayerIndex(0);
      setPhase(isAuctionActive ? 'AUCTION_REVEAL' : 'REVEAL_TRANSITION');
    } catch (error: any) {
      setIsAiLoading(false);
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetGame = () => {
    setPhase('HOME'); setOutcome(null); setPlayers([]); setCurrentPlayerIndex(0); setVirusPoints(0); setIsAiLoading(false); setNotification(null);
  };

  return {
    phase, setPhase, gameCategory, setGameCategory, playerCount, setPlayerCount,
    playerNames, setPlayerNames, imposterCount, setImposterCount,
    hasMrWhite, setHasMrWhite, 
    includeHints, setIncludeHints, includeTaboo, setIncludeTaboo, 
    isAuctionActive, setIsAuctionActive, isBlindBidding, setIsBlindBidding, 
    gameMode, setGameMode, groupMode, setGroupMode, mainMode, setMainMode, 
    useAiMissions, setUseAiMissions, isAiLoading, roleDistributionMode, setRoleDistributionMode, 
    customRoleConfig, setCustomRoleConfig, scenarioSets, setScenarioSets, 
    activeSetIds, setActiveSetIds, wordSets, setWordSets, 
    activeWordSetIds, setActiveWordSetIds, inquestSets, setInquestSets, 
    activeInquestSetIds, setActiveInquestSetIds, virusSets, setVirusSets, 
    activeVirusSetIds, setActiveVirusSetIds, players, setPlayers, 
    currentPlayerIndex, setCurrentPlayerIndex, gameContext, outcome, setOutcome, 
    virusPoints, setVirusPoints, lastEliminatedPlayer, setLastEliminatedPlayer,
    soundEnabled, setSoundEnabled, musicEnabled, setMusicEnabled, musicVolume, setMusicVolume, 
    bgAnimationEnabled, setBgAnimationEnabled, slotMachineEnabled, setSlotMachineEnabled, 
    requireRememberConfirmation, setRequireRememberConfirmation, meetingDuration, setMeetingDuration,
    meetingTimerSettings, setMeetingTimerSettings,
    lastStandDuration, setLastStandDuration, allTimePoints, gameHistory, playerCredits, notification, setNotification,
    activeRolesInPlay: players.length > 0 ? Array.from(new Set(players.map(p => p.role))) : [],
    handleStart, resetGame, awardPoints, clearStats,
    handleDetectionTrigger: () => {
      const n = virusPoints + 1; setVirusPoints(n);
      if (n >= 3) {
        setOutcome({ winner: 'VIRUS', reason: 'System Breach! 3 Detection Points reached.' });
        awardPoints('VIRUS', 'Critical failure'); setPhase('RESULTS');
      }
    },
    handleVirusGuess: (correct: boolean) => {
      if (correct) {
        setOutcome({ winner: 'HUMANS', reason: `Purge Successful! Identified: ${gameContext?.virusWord}` });
        awardPoints('HUMANS', 'Virus removed');
      } else {
        setOutcome({ winner: 'VIRUS', reason: `Failed Guess. Virus was: ${gameContext?.virusWord}` });
        awardPoints('VIRUS', 'Failed purge');
      }
      setPhase('RESULTS');
    }
  };
};
