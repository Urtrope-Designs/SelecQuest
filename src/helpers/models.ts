export interface Task {
    completionTimeoutId?: any;
    description: string;
    durationMs: number;
    results: CharacterModification[];
}

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
    equipment: {type: string, description: string}[];
    accolades: {type: AccoladeType, received: string[]}[];
    affiliations: {type: AffiliationType, received: string[]}[];
    maxEncumbrance: number;
    maxEquipmentIntegrity: number;
    maxQuestLogSize: number;
    gold: number;
    renown: number;
    spentRenown: number;
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
    fatigue: number;
    maxFatigue: number;
    socialExposure: number;
    maxSocialCapital: number;
    currentAdventure: {name: string, progressRequired: number};
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