export type NPCId = 'arka' | 'nara' | 'saga';

export type ScreenMode = 'menu' | 'setup' | 'turn_order' | 'playing' | 'victory';

export type TileType =
  | 'start'
  | 'country'
  | 'chance'
  | 'community_chest'
  | 'free_parking'
  | 'jail'
  | 'go_to_jail';

export type ContinentId = 'eropa' | 'asia' | 'amerika' | 'afrika_oseania' | 'special';

export type FacilityId = 'pusat_inovasi' | 'pabrik_pintar' | 'pendidikan_digital';

export interface FacilityDef {
  id: FacilityId;
  name: string;
  shortName: string;
  costMultiplier: number; // multiplied by base country price
  rentBonus: number; // flat rent added
  description: string;
}

export interface TileConfig {
  index: number;
  id: string;
  name: string;
  type: TileType;
  continent: ContinentId;
  continentLabel: string;
  color: string;
  accentColor: string;
  price?: number;
  baseRent?: number;
  flagColors?: [string, string, string];
  flagDirection?: 'horizontal' | 'vertical' | 'cross' | 'circle' | 'star' | 'canton';
  countryCode?: string;
  shortInfo: string;
}

export interface Question {
  id: string;
  category:
    | 'Revolusi Industri'
    | 'Era Digital'
    | 'Tantangan Global'
    | 'Dampak Teknologi'
    | 'Strategi Masa Depan';
  deckTag?: 'chance' | 'community_chest' | 'country';
  countryId?: string;
  difficulty: 'Dasar' | 'Menengah' | 'Lanjut';
  scenario?: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  npc: NPCId;
}

export type CardEffectType = 'coins' | 'move' | 'jail_free' | 'trivia';

export interface CardItem {
  id: string;
  deck: 'chance' | 'community_chest';
  title: string;
  description: string;
  effectType: CardEffectType;
  coinDelta?: number;
  moveSteps?: number;
  questionId?: string;
  npc: NPCId;
}

export interface PawnSkin {
  id: string;
  name: string;
  color: string;
  secondaryColor: string;
  label: string;
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  pawnId: string;
  color: string;
  secondaryColor: string;
  position: number;
  coins: number;
  learningPoints: number;
  correctAnswers: number;
  totalAnswers: number;
  challengesCompleted: number;
  ownedCountries: string[]; // tile ids
  facilities: Record<string, FacilityId[]>; // tileId -> facility ids built
  inJail: boolean;
  jailTurns: number;
  jailFreeCards: number;
  bankrupt: boolean;
  lapsCompleted: number;
}

export interface GameConfig {
  startingCoins: number;
  startPassBonus: number;
  correctAnswerPoints: number;
  challengePoints: number;
  jailFine: number;
  maxRounds: number; // 0 = unlimited / until manual finish or 1 player left
  targetWealth: number; // 0 = disabled, otherwise e.g. 2500
}

export interface AudioSettings {
  musicEnabled: boolean;
  musicPaused: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}

export interface LearningProgressState {
  exp: number;
  openedSections: Record<string, string[]>;
  completedTopics: string[];
}

export type CameraPreset = 'isometric' | 'top' | 'follow';

export interface NPCDialogueState {
  npc: NPCId;
  message: string;
  mood: 'happy' | 'encourage' | 'critical' | 'celebrate';
  timestamp: number;
}

export interface FloatingEvent {
  id: string;
  tileIndex: number;
  text: string;
  color: string;
}

export type ActiveModalState =
  | { type: 'none' }
  | {
      type: 'country_quiz';
      tile: TileConfig;
      question: Question;
      selectedOption: number | null;
      answered: boolean;
      isCorrect: boolean;
    }
  | {
      type: 'country_buy';
      tile: TileConfig;
      fromCorrectQuiz: boolean;
    }
  | {
      type: 'country_develop';
      tile: TileConfig;
    }
  | {
      type: 'card_draw';
      card: CardItem;
      question?: Question;
      selectedOption: number | null;
      answered: boolean;
      isCorrect: boolean;
    }
  | {
      type: 'rent_notice';
      tile: TileConfig;
      ownerName: string;
      ownerColor: string;
      amount: number;
    }
  | {
      type: 'jail_turn';
      player: Player;
    }
  | {
      type: 'tile_info';
      tile: TileConfig;
    };
