import { useState, useEffect, useCallback } from 'react';
import { 
  GamePhase, Player, Role, GameMode, MainMode, GroupMode, 
  GameContext, ScenarioSet, WordSet, InquestSet, 
  HistoryEntry, RoleDistributionMode, CustomRoleConfig, PowerUp, RiskContract, GameCategory, VirusSet 
} from '../types';
import { 
  DEFAULT_SET, DEFAULT_WORD_SETS, DEFAULT_INQUEST_SET, VIRUS_WORDS_SET,
  INITIAL_PLAYER_COUNT, TABOO_CONSTRAINTS, MAX_PLAYERS
} from '../constants';
import { generateScenarioContext, generateVirusNoiseWords, generateAIPrompt } from '../services/geminiService';
import { soundService } from '../services/soundService';

export const useGameState = () => {
  // Persistence Keys
  const POINTS_KEY = 'imposter_points';
  const HISTORY_KEY = 'imposter_history';
  const SETTINGS_KEY = 'imposter_settings';

  // Game Configuration State
  const [phase, setPhase] = useState<GamePhase>('HOME');
  const [gameCategory, setGameCategory] = useState<GameCategory>(GameCategory.PVP);
  const [playerCount, setPlayerCount] = useState(INITIAL_PLAYER_COUNT);
  const [playerNames, setPlayerNames] = useState<string[]>(Array.from({ length: MAX_PLAYERS }, (_, i) => `Agent ${i + 1}`));
  const [imposterCount, setImposterCount] = useState(1);
  const [hasMrWhite, setHasMrWhite] = useState(false);
  const [hasAnarchist, setHasAnarchist] = useState(false);
  const [hasMimic, setHasMimic] = useState(false);
  const [hasOracle, setHasOracle] = useState(false);
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

  // Advanced Role Config
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

  // Library/Sets State
  const [scenarioSets, setScenarioSets] = useState<ScenarioSet[]>([DEFAULT_SET]);
  const [activeSetIds, setActiveSetIds] = useState<string[]>(['default']);
  const [wordSets, setWordSets] = useState<WordSet[]>(DEFAULT_WORD_SETS);
  const [activeWordSetIds, setActiveWordSetIds] = useState<string[]>(['default-words']);
  const [inquestSets, setInquestSets] = useState<InquestSet[]>([DEFAULT_INQUEST_SET]);
  const [activeInquestSetIds, setActiveInquestSetIds] = useState<string[]>(['default-inquest']);
  const [virusSets, setVirusSets] = useState<VirusSet[]>([VIRUS_WORDS_SET]);
  const [activeVirusSetIds, setActiveVirusSetIds] = useState<string[]>(['virus-default']);

  // Active Session State
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameContext, setGameContext] = useState<GameContext | null>(null);
  const [outcome, setOutcome] = useState<{ winner: string, reason: string } | null>(null);
  const [virusPoints, setVirusPoints] = useState(0);
  const [lastEliminatedPlayer, setLastEliminatedPlayer] = useState<Player | null>(null);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [bgAnimationEnabled, setBgAnimationEnabled] = useState(true);
  const [meetingDuration, setMeetingDuration] = useState(120);
  const [lastStandDuration, setLastStandDuration] = useState(10);

  // Load Settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSoundEnabled(parsed.soundEnabled ?? true);
        setMusicEnabled(parsed.musicEnabled ?? true);
        setBgAnimationEnabled(parsed.bgAnimationEnabled ?? true);
        setMeetingDuration(parsed.meetingDuration ?? 120);
        setLastStandDuration(parsed.lastStandDuration ?? 10);
      }
    } catch (e) {}
  }, []);

  // Save Settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      soundEnabled, musicEnabled, bgAnimationEnabled, meetingDuration, lastStandDuration
    }));
  }, [soundEnabled, musicEnabled, bgAnimationEnabled, meetingDuration, lastStandDuration]);

  // Persistent Stats
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

  // Fix for Imposter Count adaptation
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

  // Sync with Disk
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

      if (winner === 'NEIGHBORS' && (p.role === Role.NEIGHBOR || p.role === Role.ORACLE)) won = true;
      if (winner === 'IMPOSTERS' && (p.role === Role.IMPOSTER || p.role === Role.MR_WHITE)) {
        won = true;
        if (p.role === Role.IMPOSTER && !includeHints) score = 20; 
      }
      if (winner === 'ANARCHIST' && p.role === Role.ANARCHIST) won = true;
      if (winner === 'MIMIC' && p.role === Role.MIMIC) {
        won = true;
        score = 20; 
      }
      if (winner === 'ORACLE' && (p.role === Role.ORACLE || p.role === Role.NEIGHBOR)) won = true;
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

        if (useAiMissions) {
          try {
            const aiPrompt = await generateAIPrompt(MainMode.VIRUS_PURGE);
            if (aiPrompt) {
              virusWord = aiPrompt.virusWord;
              realWord = aiPrompt.realWord;
              const noiseData = await generateVirusNoiseWords(realWord, virusWord);
              if (noiseData?.noiseWords) noiseWords = noiseData.noiseWords;
            } else throw new Error("Connection Timeout or Rate Limit");
          } catch (e: any) {
            console.warn("AI Failure, using fallback", e);
            setNotification({ 
              message: "Neural Link unstable. Using local Standard Library fallback.", 
              type: 'warning' 
            });
            const vs = virusSets[0];
            virusWord = vs.words[Math.floor(Math.random() * vs.words.length)];
            realWord = wordSets[0].pairs[0].wordA;
          }
        } else {
          const vs = virusSets.find(s => activeVirusSetIds.includes(s.id)) || virusSets[0];
          virusWord = vs.words[Math.floor(Math.random() * vs.words.length)];
          const ws = wordSets.find(s => activeWordSetIds.includes(s.id)) || wordSets[0];
          realWord = ws.pairs[Math.floor(Math.random() * ws.pairs.length)].wordA;
        }

        const context: GameContext = {
          mainMode: MainMode.VIRUS_PURGE,
          realProject: realWord,
          virusWord,
          noiseWords,
          location: 'Secure Uplink',
          imposterProject: 'THREAT_DETECTED',
          distractors: [],
          includeHints: true,
          hasOracleActive: false,
          isAuctionActive: false,
          isBlindBidding: false,
          availablePowers: [],
          startingPlayerName: playerNames[Math.floor(Math.random() * playerCount)]
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

      // PVP Logic
      const roles: Role[] = [];
      const specialPool = [Role.MR_WHITE, Role.ANARCHIST, Role.MIMIC, Role.ORACLE].filter(r => {
        if (r === Role.MR_WHITE) return hasMrWhite;
        if (r === Role.ANARCHIST) return hasAnarchist;
        if (r === Role.MIMIC) return hasMimic;
        if (r === Role.ORACLE) return hasOracle;
        return false;
      });
      const activeSpecialPool = specialPool.length > 0 ? specialPool : [Role.MR_WHITE, Role.ANARCHIST, Role.MIMIC, Role.ORACLE];

      if (roleDistributionMode === RoleDistributionMode.STANDARD) {
        for (let i = 0; i < imposterCount; i++) roles.push(Role.IMPOSTER);
        if (hasMrWhite) roles.push(Role.MR_WHITE);
        if (hasAnarchist) roles.push(Role.ANARCHIST);
        if (hasMimic) roles.push(Role.MIMIC);
        if (hasOracle) roles.push(Role.ORACLE);
        while (roles.length < playerCount) roles.push(Role.NEIGHBOR);
      } else if (roleDistributionMode === RoleDistributionMode.CUSTOM) {
        const { imposterCount: iCount, specialCount: sCount, neighborCount: nCount } = customRoleConfig;
        for (let i = 0; i < iCount; i++) roles.push(Role.IMPOSTER);
        for (let i = 0; i < sCount; i++) roles.push(activeSpecialPool[Math.floor(Math.random() * activeSpecialPool.length)]);
        for (let i = 0; i < nCount; i++) roles.push(Role.NEIGHBOR);
      } else {
        const { minImposters, maxImposters, minSpecials, maxSpecials } = customRoleConfig;
        let actualImposters = Math.floor(Math.random() * (maxImposters - minImposters + 1)) + minImposters;
        let actualSpecials = Math.floor(Math.random() * (maxSpecials - minSpecials + 1)) + minSpecials;
        for (let i = 0; i < actualImposters; i++) roles.push(Role.IMPOSTER);
        for (let i = 0; i < actualSpecials; i++) roles.push(activeSpecialPool[Math.floor(Math.random() * activeSpecialPool.length)]);
        while (roles.length < playerCount) roles.push(Role.NEIGHBOR);
      }

      const shuffledRoles = [...roles].sort(() => Math.random() - 0.5).slice(0, playerCount);
      const availablePowers = Object.values(PowerUp).sort(() => Math.random() - 0.5).slice(0, 3);

      let wordA = "Coffee", wordB = "Tea";
      let location = "Terms Office", realProject = "Coffee", catchRule = "No sugar";
      let distractors: string[] = ["Library", "Park", "Gym"];
      let imposterProject = "Tea";

      if (useAiMissions) {
        try {
          const aiPrompt = await generateAIPrompt(mainMode);
          if (!aiPrompt) throw new Error("AI Null Response");
          
          if (mainMode === MainMode.TERMS || mainMode === MainMode.PAIR) {
            wordA = aiPrompt?.wordA || wordA;
            wordB = aiPrompt?.wordB || wordB;
            realProject = wordA;
            imposterProject = wordB;
          } else {
            realProject = aiPrompt?.project || realProject;
            location = aiPrompt?.location || location;
            catchRule = aiPrompt?.catch || catchRule;
          }
        } catch (e: any) {
          console.warn("AI Mission Gen Failed, fallback engaged.", e);
          setNotification({ 
            message: "Neural Link severed. Mission parameters sourced from local archives.", 
            type: 'warning' 
          });
        }
      } else {
        if (mainMode === MainMode.TERMS || mainMode === MainMode.PAIR) {
          const activeSets = wordSets.filter(s => activeWordSetIds.includes(s.id));
          const randomSet = activeSets[Math.floor(Math.random() * activeSets.length)] || wordSets[0];
          const pair = randomSet.pairs[Math.floor(Math.random() * randomSet.pairs.length)];
          wordA = pair.wordA; wordB = pair.wordB;
          realProject = wordA; imposterProject = wordB;
        } else {
          const activeSets = scenarioSets.filter(s => activeSetIds.includes(s.id));
          const randomSet = activeSets[Math.floor(Math.random() * activeSets.length)] || scenarioSets[0];
          realProject = randomSet.projects[Math.floor(Math.random() * randomSet.projects.length)];
          location = randomSet.locations[Math.floor(Math.random() * randomSet.locations.length)];
          catchRule = randomSet.catches[Math.floor(Math.random() * randomSet.catches.length)];
        }
      }

      // Context construction
      let context: GameContext;
      if (mainMode === MainMode.TERMS || mainMode === MainMode.PAIR) {
        if (mainMode === MainMode.PAIR) {
          const pool = [wordA, wordB, "Sugar", "Milk", "Honey"];
          const chain = Array.from({length: playerCount}).map((_, i) => pool[i % pool.length]);
          context = { mainMode, realProject: chain[0], imposterProject: '???', location: 'The Chain', distractors: pool.slice(0, 3), includeHints: false, hasOracleActive: shuffledRoles.includes(Role.ORACLE), dualWordsChain: chain, isAuctionActive, isBlindBidding, availablePowers };
        } else {
          context = { mainMode, realProject, imposterProject: includeHints ? imposterProject : '???', location: 'Terms Office', distractors: [], includeHints, tabooConstraint: includeTaboo ? TABOO_CONSTRAINTS[Math.floor(Math.random() * TABOO_CONSTRAINTS.length)] : undefined, hasOracleActive: shuffledRoles.includes(Role.ORACLE), isAuctionActive, isBlindBidding, availablePowers };
        }
      } else {
        try {
          const scenarioData = await generateScenarioContext(realProject, location);
          imposterProject = scenarioData.imposterProject;
          distractors = scenarioData.distractors;
        } catch { /* use fallbacks */ }
        context = { mainMode, realProject, location, catchRule, imposterProject: includeHints ? imposterProject : '???', distractors, includeHints, hasOracleActive: shuffledRoles.includes(Role.ORACLE), isAuctionActive, isBlindBidding, availablePowers };
      }

      const finalPlayers: Player[] = shuffledRoles.map((role, i) => {
        const name = playerNames[i];
        let p1 = '', p2 = undefined;
        if (mainMode === MainMode.PAIR) {
          const prevIdx = (i - 1 + playerCount) % playerCount;
          const currentIdx = i;
          if ([Role.IMPOSTER, Role.MR_WHITE, Role.MIMIC].includes(role)) { p1 = "???"; p2 = "???"; }
          else { p1 = context.dualWordsChain![prevIdx]; p2 = context.dualWordsChain![currentIdx]; }
        } else {
          if ([Role.NEIGHBOR, Role.ANARCHIST].includes(role)) p1 = context.realProject;
          else if (role === Role.IMPOSTER) p1 = context.imposterProject;
          else p1 = '???';
        }
        return { id: `p-${i + 1}`, name, role, assignedProject: p1, assignedProject2: p2, inquestAnswers: [], credits: initialCredits[name] || 10 };
      });

      const oraclePlayer = finalPlayers.find(p => p.role === Role.ORACLE);
      if (oraclePlayer) {
        const imposter = finalPlayers.find(p => p.role === Role.IMPOSTER);
        if (imposter) oraclePlayer.oracleTargetName = imposter.name;
      }

      context.startingPlayerName = finalPlayers[Math.floor(Math.random() * finalPlayers.length)].name;
      setGameContext(context);
      setPlayers(finalPlayers);
      setCurrentPlayerIndex(0);
      setPhase(isAuctionActive ? 'AUCTION_REVEAL' : 'REVEAL_TRANSITION');
    } catch (error: any) {
      console.error("Critical Start Error:", error);
      setNotification({ 
        message: "Critical Deployment Failure. System link inaccessible.", 
        type: 'error' 
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetGame = () => {
    setPhase('HOME');
    setOutcome(null);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setVirusPoints(0);
    setIsAiLoading(false);
    setNotification(null);
  };

  return {
    // State
    phase, setPhase, gameCategory, setGameCategory, playerCount, setPlayerCount,
    playerNames, setPlayerNames, imposterCount, setImposterCount,
    hasMrWhite, setHasMrWhite, hasAnarchist, setHasAnarchist,
    hasMimic, setHasMimic, hasOracle, setHasOracle, includeHints, setIncludeHints,
    includeTaboo, setIncludeTaboo, isAuctionActive, setIsAuctionActive,
    isBlindBidding, setIsBlindBidding, gameMode, setGameMode, groupMode, setGroupMode,
    mainMode, setMainMode, useAiMissions, setUseAiMissions, isAiLoading,
    roleDistributionMode, setRoleDistributionMode, customRoleConfig, setCustomRoleConfig,
    scenarioSets, setScenarioSets, activeSetIds, setActiveSetIds,
    wordSets, setWordSets, activeWordSetIds, setActiveWordSetIds,
    inquestSets, setInquestSets, activeInquestSetIds, setActiveInquestSetIds,
    virusSets, setVirusSets, activeVirusSetIds, setActiveVirusSetIds,
    players, setPlayers, currentPlayerIndex, setCurrentPlayerIndex,
    gameContext, outcome, setOutcome, virusPoints, setVirusPoints,
    lastEliminatedPlayer, setLastEliminatedPlayer,
    soundEnabled, setSoundEnabled, musicEnabled, setMusicEnabled, bgAnimationEnabled, setBgAnimationEnabled,
    meetingDuration, setMeetingDuration,
    lastStandDuration, setLastStandDuration, allTimePoints, gameHistory, playerCredits,
    notification, setNotification,
    // Actions
    handleStart, resetGame, awardPoints, clearStats,
    handleDetectionTrigger: () => {
      if (soundEnabled) soundService.playCaught();
      const n = virusPoints + 1;
      setVirusPoints(n);
      if (n >= 3) {
        setOutcome({ winner: 'VIRUS', reason: 'System Breach! 3 Detection Points reached.' });
        awardPoints('VIRUS', 'Critical failure');
        setPhase('RESULTS');
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