export enum Role {
  NEIGHBOR = 'Neighbor',
  IMPOSTER = 'Imposter',
  MR_WHITE = 'Mr. White',
  ANARCHIST = 'Anarchist',
  MIMIC = 'The Mimic',
  ORACLE = 'The Oracle'
}

export enum GameMode {
  NORMAL = 'Normal', // Imposters know each other
  MYSTERIOUS = 'Mysterious' // Imposters don't know they are imposters
}

export enum GroupMode {
  CLASSIC = 'Classic',
  ADVANCED = 'Advanced'
}

export enum GameCategory {
  PVP = 'PvP (Competitive)',
  PVE = 'Co-op (PvE)'
}

export enum MainMode {
  TERMS = 'Terms',
  SCHEME = 'Scheme',
  INQUEST = 'Inquest',
  INVESTMENT = 'Investment',
  PAIR = 'Pair',
  VIRUS_PURGE = 'Virus Purge'
}

export enum PowerUp {
  POLYGRAPH = 'The Polygraph',
  GHOST_WHISPER = 'The Ghost Whisper',
  VETO = 'The Veto',
  DOUBLE_VOTE = 'The Double Vote',
  INSIGHT = 'The Insight'
}

export enum RiskContract {
  VERBOSE = 'The Verbose',
  MINIMALIST = 'The Minimalist',
  TARGET = 'The Target'
}

export enum RoleDistributionMode {
  STANDARD = 'Standard',
  CUSTOM = 'Custom',
  SURPRISE = 'Surprise'
}

export interface CustomRoleConfig {
  neighborCount: number;
  imposterCount: number;
  specialCount: number;
  minImposters: number;
  maxImposters: number;
  minSpecials: number;
  maxSpecials: number;
}

export interface InvestmentSpend {
  [category: string]: number;
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  assignedProject: string; 
  assignedProject2?: string; // For Pair mode
  inquestAnswers: string[]; 
  investmentSpend?: InvestmentSpend;
  oracleTargetName?: string; // For the Oracle role
  credits: number;
  activePower?: PowerUp;
  activeRisk?: RiskContract;
  bidAmount?: number;
}

export interface HistoryEntry {
  id: string;
  date: string;
  winner: 'NEIGHBORS' | 'IMPOSTERS' | 'ANARCHIST' | 'MIMIC' | 'ORACLE' | 'HUMANS' | 'VIRUS';
  reason: string;
  mode: MainMode;
  players: { name: string, role: Role }[];
}

export interface ScenarioSet {
  id: string;
  name: string;
  projects: string[];
  locations: string[];
  catches: string[];
}

export interface WordPair {
  wordA: string;
  wordB: string;
}

export interface WordSet {
  id: string;
  name: string;
  pairs: WordPair[];
}

export interface InquestScenario {
  id: string;
  realProject: string;
  fakeProject: string;
  location: string;
  options: string[]; 
  questions: string[]; 
}

export interface InquestSet {
  id: string;
  name: string;
  scenarios: InquestScenario[];
}

export interface VirusSet {
  id: string;
  name: string;
  words: string[];
}

export interface GameContext {
  mainMode: MainMode;
  realProject: string;
  location: string;
  catchRule?: string; 
  tabooConstraint?: string; 
  imposterProject: string;
  distractors: string[]; 
  inquestOptions?: string[]; 
  inquestQuestions?: string[]; 
  investmentCategories?: string[];
  includeHints: boolean;
  startingPlayerName?: string;
  hasOracleActive: boolean;
  dualWordsChain?: string[]; // Chain for Pair mode
  isAuctionActive: boolean;
  isBlindBidding: boolean;
  availablePowers: PowerUp[];
  virusWord?: string;
  noiseWords?: string[];
}

export type GamePhase = 
  | 'HOME'
  | 'SETUP'
  | 'AUCTION_REVEAL'
  | 'AUCTION_BIDDING'
  | 'AUCTION_TRANSITION'
  | 'REVEAL' 
  | 'REVEAL_TRANSITION' 
  | 'STARTING_PLAYER_ANNOUNCEMENT'
  | 'MEETING' 
  | 'INQUEST_QUESTION' 
  | 'INQUEST_SELECTION' 
  | 'INQUEST_TRANSITION' 
  | 'INQUEST_REVEAL' 
  | 'INVESTMENT_INPUT'
  | 'INVESTMENT_TRANSITION'
  | 'INVESTMENT_REVEAL'
  | 'VOTING' 
  | 'LAST_STAND' 
  | 'ORACLE_GUESS'
  | 'MIMIC_GUESS'
  | 'VIRUS_GUESS'
  | 'RESULTS' 
  | 'SETTINGS'
  | 'LEADERBOARD'
  | 'HELP';