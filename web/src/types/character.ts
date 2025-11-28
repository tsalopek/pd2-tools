export interface ICharacter {
  name: string;
  level: number;
  life: number;
  mana: number;
  class: { id: number; name: string };
  skills: Array<{ id: number; name: string; level: number }>;
  attributes?: {
    strength: number;
    dexterity: number;
    vitality: number;
    energy: number;
  };
}

export interface IItem {
  name: string;
  quality: { name: string; id?: number };
  runeword?: boolean;
  location?: {
    equipment?: string;
    x?: number;
    y?: number;
  };
  properties?: string[];
}

export interface IMercenary {
  name?: string;
  type?: string;
  level?: number;
}

export interface FullCharacterResponse {
  character: ICharacter | null;
  items: IItem[] | null;
  mercenary?: unknown;
  nullReason?: string;
  realSkills?: unknown[];
  lastUpdated?: number;
  [key: string]: unknown;
}

export interface CharacterFilter {
  requiredClasses?: string[];
  requiredItems?: string[];
  requiredSkills?: Array<{ name: string; minLevel: number }>;
  levelRange?: {
    min?: number;
    max?: number;
  };
  season?: number;
}

export interface CharacterListResponse {
  total: number;
  characters: FullCharacterResponse[];
  breakdown: Record<string, number>;
}

export interface ItemUsageStats {
  item: string;
  itemType: "Unique" | "Set" | "Runeword";
  numOccurrences: number;
  totalSample: number;
  pct: number;
}

export interface SkillUsageStats {
  name: string;
  numOccurrences: number;
  totalSample: number;
  pct: number;
}

// Level distribution (single item)
export interface LevelDistribution {
  level: number;
  count: number;
}

// Level distribution API response (softcore + hardcore)
export interface LevelDistributionData {
  softcore: LevelDistribution[];
  hardcore: LevelDistribution[];
}

// Character counts by game mode
export interface CharacterCounts {
  softcore: number;
  hardcore: number;
}

// Character attributes (base stats)
export interface CharacterAttributes {
  strength: number;
  dexterity: number;
  vitality: number;
  energy: number;
}

// Basic character stats (life/mana)
export interface CharacterStats {
  life: number;
  mana: number;
}

// Real/calculated character stats (with gear)
export interface RealStats {
  strength: number;
  dexterity: number;
  vitality: number;
  energy: number;
  fireRes: number;
  maxFireRes: number;
  coldRes: number;
  maxColdRes: number;
  lightningRes: number;
  maxLightningRes: number;
  poisonRes: number;
  maxPoisonRes: number;
  fAbsorbFlat: number;
  fAbsorbPct: number;
  cAbsorbFlat: number;
  cAbsorbPct: number;
  lAbsorbFlat: number;
  lAbsorbPct: number;
  fcr: number;
  fhr: number;
  frw: number;
  gf: number;
  ias: number;
  mf: number;
  pdr: number;
}

// Skill representation
export interface Skill {
  skill: string;
  baseLevel: number;
  level: number;
}

// Mercenary info
export interface MercenaryInfo {
  name?: string;
  type?: string;
  level?: number;
  items?: unknown[];
  description?: string;
}
