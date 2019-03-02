import { HeroAbilityType, Adventure, HeroEquipment as LootMajorReward } from "./hero-models";
import { TaskMode } from "./task-models";

/** Task related */
export interface Task {
    taskStartTime?: number;
    description: string;
    durationMs: number;
    resultingHero: Hero;
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
    ADD_CURRENCY,
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
    
    // build-up rewards
    lootBuildUpRewards: LootBuildUpReward[];
    trialBuildUpRewards: TrialBuildUpReward[];
    questBuildUpRewards: QuestBuildUpReward[];

    // build-up limits
    maxLootBuildUp: number;
    maxTrialBuildUp: number;
    maxQuestBuildUp: number;

    isInTeardownMode: boolean[];

    // currency
    currency: number[];
    spentCurrency: number[];
    reputation: number;
    spentReputation: number;

    // major rewards
    equipment: LootMajorReward[];
    accolades: TrialMajorReward[];
    affiliations: QuestMajorReward[];

    // long-term limits
    lootEnvironmentalLimit: number;
    maxLootEnvironmentalLimit: number;
    trialEnvironmentalLimit: number;
    maxTrialEnvironmentalLimit: number;
    questEnvironmentalLimit: number;
    maxQuestEnvironmentalLimit: number;

    currentAdventure: Adventure;
    completedAdventures: string[];
    adventureProgress: number;
    latestModifications: {attributeName: string, data: any}[];
    gameSettingId: string;
}

export interface TrialMajorReward {
    type: AccoladeType,
    received: string[],
};

export interface QuestMajorReward {
    groupName: string,
    connection: HeroConnection,
    office: string,
}

export interface HeroConnection {
    personName: string,
    personTitle: string,
}

export interface LootBuildUpReward {
    name: string,
    quantity: number,
    value: number,
};

export interface TrialBuildUpReward {
    name: string,
    quantity: number,
    value: number,
};

export interface QuestBuildUpReward {
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

/** Other :) */

export interface AppState {
    activeTask: Task;
    hasActiveTask: boolean;
    hero: Hero;
    activeTaskMode: TaskMode;
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
