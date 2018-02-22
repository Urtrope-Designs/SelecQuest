export interface Task {
    completionTimeoutId?: any;
    description: string;
    durationMs: number;
    results: {};
}

export interface Character {
    name: string;
    race: string;
    class: string;
    level: number;
    /* states */
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
    /* end stats */
    maxHp: number;
    maxMp: number;
    currentXp: number;
    spells: {name: string, rank: number}[]; 
    abilities: {name: string, rank: number}[]; 
    equipment: {type: string, description: string, rating: number}[];
    accolades: {type: AccoladeType, received: string[]}[];
    affiliations: {type: AffiliationType, received: string[]}[];
    maxEncumbrance: number;
    maxEquipmentIntegrity: number;
    maxQuestLogSize: number;
    gold: number;
    renown: number;
    reputation: number;
    spentReputation: number;
    loot: {name: string, quantity: number, value: number}[];
    trophies: {name: string, quantity: number, value: number}[];
    leads: {name: string, value: number}[];
    isInLootSelloffMode: boolean;
    isInTrophyBoastingMode: boolean;
    isInLeadFollowingMode: boolean;
    marketSaturation: number;
    maxMarketSaturation: number;
    staminaSpent: number;
    maxStamina: number;
    socialExposure: number;
    maxSocialCapital: number;
    completedAdventures: string[];
    adventureProgress: number;
}

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

export enum TaskMode {
    LOOTING,
    GLADIATING,
    INVESTIGATING,
}

export interface AppState {
    activeTask: Task;
    hasActiveTask: boolean;
    character: Character;
    activeTaskMode: TaskMode
}