import { Adventure } from "./storyline-helpers";

/** Task related */
export interface Task {
    completionTimeoutId?: any;
    description: string;
    durationMs: number;
    results: CharacterModification[];
}

export enum TaskMode {
    LOOTING,
    GLADIATING,
    INVESTIGATING,
}

export enum TaskTargetType {
    LOCATION,
    MONSTER,
    DUEL,
    TRIAL,
    INTERROGATION,
    INVESTIGATION,
};

export interface LootingTarget {
    type: TaskTargetType,
    name: string,
    level: number,
    reward: string,
};

export interface GladiatingTarget {
    type: TaskTargetType,
    name: string,
    level: number,
    reward: string,
};

export interface LeadGatheringTarget {
    gerundPhrase: string,
    predicateOptions: string[],
    leadTypes: LeadType[],
}

export enum LeadType {
    FETCH,
    DELIVER,
    SEEK,
    EXTERMINATE,
    PLACATE,
    NURSE,
    DEFEND,
}

export interface LeadTarget {
    verb: string,
    predicateFactory: () => string,
}

/** Character Related */

export interface CharacterModification {
    type: CharacterModificationType,
    attributeName: string,
    data: any,
    // data: string | number | {name: string, rank: number}[] | {type: string, description: string, rating: number}[] | {type: AccoladeType, received: string[]}[] | {type: AffiliationType, received: string[]}[] | {name: string, quantity: number, value: number} | {name: string, value: string} | string[],
}

export enum CharacterModificationType {
    INCREASE,
    DECREASE,
    SET,
    SET_EQUIPMENT,
    ADD,
    ADD_QUANTITY,
    ADD_RANK,
    ADD_ACCOLADE,
    ADD_AFFILIATION,
    REMOVE,
    REMOVE_QUANTITY,
}

class CharacterStats {
    'str': number = 0;
    'dex': number = 0;
    'con': number = 0;
    'int': number = 0;
    'wis': number = 0;
    'cha': number = 0;
}

const charStats = new CharacterStats();
export function getCharacterStatList(): string[] {
    return Object.keys(charStats);
}

export interface Character extends CharacterStats {
    name: string;
    raceName: string;
    class: string;
    level: number;
    /* stats inherited from CharacterStats */
    // str: number;
    // dex: number;
    // con: number;
    // int: number;
    // wis: number;
    // cha: number;
    /* end stats */
    maxHp: number;
    maxMp: number;
    currentXp: number;
    spells: CharSpell[]; 
    abilities: CharAbility[]; 
    equipment: CharEquipment[];
    accolades: CharAccolade[];
    affiliations: CharAffilitation[];
    maxEncumbrance: number;
    maxEquipmentWear: number;
    maxQuestLogSize: number;
    gold: number;
    renown: number;
    spentRenown: number;
    reputation: number;
    spentReputation: number;
    loot: CharLoot[];
    trophies: CharTrophy[];
    leads: CharLead[];
    isInLootSelloffMode: boolean;
    isInTrophyBoastingMode: boolean;
    isInLeadFollowingMode: boolean;
    marketSaturation: number;
    maxMarketSaturation: number;
    fatigue: number;
    maxFatigue: number;
    socialExposure: number;
    maxSocialCapital: number;
    currentAdventure: Adventure;
    completedAdventures: string[];
    adventureProgress: number;
}

export interface CharSpell {
    name: string,
    rank: number,
};

export interface CharAbility {
    name: string,
    rank: number,
};

export interface CharEquipment {
    type: string,
    description: string,
};

export interface CharAccolade {
    type: AccoladeType,
    received: string[],
};

export interface CharAffilitation {
    type: AffiliationType,
    received: string[],
};

export interface CharLoot {
    name: string,
    quantity: number,
    value: number,
};

export interface CharTrophy {
    name: string,
    quantity: number,
    value: number,
};

export interface CharLead {
    questlogName: string,
    taskName: string,
    value: number,
};

export enum AccoladeType {
    Epithets,
    Titles,
    Sobriquets,
    Honorifics,
}

export enum AffiliationType {
    Connections,
    Affiliations,
    Offices,
}

/** Other :) */

export interface AppState {
    activeTask: Task;
    hasActiveTask: boolean;
    character: Character;
    activeTaskMode: TaskMode
}

export interface CharRace {
    raceName: string,
    trophyName: string,
}
