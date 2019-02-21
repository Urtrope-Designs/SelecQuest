import { HeroAbilityType, Adventure } from "./hero-models";

/** Task related */
export interface Task {
    taskStartTime?: number;
    description: string;
    durationMs: number;
    results: HeroModification[];
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

/** Hero Related */

export interface HeroModification {
    type: HeroModificationType,
    attributeName: string,
    data: any,
    // data: string | number | {name: string, rank: number}[] | {type: string, description: string, rating: number}[] | {type: AccoladeType, received: string[]}[] | {type: AffiliationType, received: string[]}[] | {name: string, quantity: number, value: number} | {name: string, value: string} | string[],
}

export enum HeroModificationType {
    INCREASE,
    DECREASE,
    SET,
    SET_EQUIPMENT,
    ADD,
    ADD_STAT,
    ADD_QUANTITY,
    ADD_RANK,
    ADD_ACCOLADE,
    ADD_AFFILIATION,
    REMOVE,
    REMOVE_QUANTITY,
    SET_TEARDOWN_MODE,
}

export interface HeroStat {
    name: string,
    value: number,
}

export interface Hero {
    name: string;
    raceName: string;
    class: string;
    level: number;
    stats: HeroStat[];
    /* stats inherited from HeroStats */
    // str: number;
    // dex: number;
    // con: number;
    // int: number;
    // wis: number;
    // cha: number;
    /* end stats */
    maxHealthStat: HeroStat;
    maxMagicStat: HeroStat;
    currentXp: number;
    abilities: HeroAbilityType[];
    
    equipment: HeroEquipment[];
    accolades: HeroAccolade[];
    affiliations: HeroAffiliation[];
    maxEncumbrance: number;
    maxEquipmentWear: number;
    maxQuestLogSize: number;
    gold: number;
    renown: number;
    spentRenown: number;
    reputation: number;
    spentReputation: number;
    loot: HeroLoot[];
    trophies: HeroTrophy[];
    leads: HeroLead[];
    isInTeardownMode: boolean[];
    // isInLootSelloffMode: boolean;
    // isInTrophyBoastingMode: boolean;
    // isInLeadFollowingMode: boolean;
    marketSaturation: number;
    maxMarketSaturation: number;
    fatigue: number;
    maxFatigue: number;
    socialExposure: number;
    maxSocialCapital: number;
    currentAdventure: Adventure;
    completedAdventures: string[];
    adventureProgress: number;
    latestModifications: {attributeName: string, data: any}[];
    gameSettingId: string;
}

export interface HeroEquipment {
    type: EquipmentType,
    description: string,
};

export interface HeroAccolade {
    type: AccoladeType,
    received: string[],
};

export interface HeroAffiliation {
    groupName: string,
    connection: HeroConnection,
    office: string,
}

export interface HeroConnection {
    personName: string,
    personTitle: string,
}

export interface HeroLoot {
    name: string,
    quantity: number,
    value: number,
};

export interface HeroTrophy {
    name: string,
    quantity: number,
    value: number,
};

export interface HeroLead {
    questlogName: string,
    taskName: string,
    value: number,
};

export enum EquipmentType {
    Weapon = 'Weapon',
    Shield = 'Shield',
    Helm = 'Helm',
    Hauberk = 'Hauberk',
    Brassairts = 'Brassairts',
    Vambraces = 'Vambraces',
    Gauntlets = 'Gauntlets',
    Gambeson = 'Gambeson',
    Cuisses = 'Cuisses',
    Greaves = 'Greaves',
    Sollerets = 'Sollerets',
}

export enum AccoladeType {
    Epithets,
    Titles,
    Sobriquets,
    Honorifics,
}

/** Other :) */

export interface AppState {
    activeTask: Task;
    hasActiveTask: boolean;
    hero: Hero;
    activeTaskMode: TaskMode
}

export interface HeroRace {
    raceName: string,
    trophyName: string,
}

export interface EquipmentModifier {
    description: string,
    levelModifier: number,
}

export interface EquipmentMaterial {
    description: string,
    baseLevel: number,
    modifierList: EquipmentModifier[],
}

export interface HeroTitlePosition {
    description: string,
    titleObjectList: string[],
}
