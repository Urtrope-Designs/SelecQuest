export interface Task {
    completionTimeoutId?: any;
    description: string;
    durationMs: number;
    results: {};
}

export interface Character {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
    maxHp: number;
    maxMp: number;
    spells: {[key: string]: {rank: number}}; 
    maxEncumbrance: number;
    loot: {[key: string]: {quantity: number, value: number}};
    trophies: {[key: string]: {quantity: number, value: number}};
    gold: number;
    isInLootSelloff: boolean;
    marketSaturation: number;
    maxMarketSaturation: number;
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