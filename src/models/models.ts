import { HeroAbilityType, Adventure, LootMajorReward } from "./hero-models";
import { TaskMode } from "./task-models";

/** Task related */
export interface Task {
    taskStartTime?: number;
    description: string;
    durationMs: number;
    resultingHero: Hero;
}

export enum TaskTargetType {
    LOCATION = 'location',
    FOE = 'foe',
    DUEL = 'duel',
    TRIAL = 'trial',
    INTERROGATION = 'interrogation',
    INVESTIGATION = 'investigation',
};

export interface TaskTarget {
    type: TaskTargetType,
    name: string,
    namePlural: string,
    level: number,
    reward: string,
    rewardPlural: string,
};

export interface LeadGatheringTarget {
    gerundPhrase: string,
    predicateOptions: string[],
    leadTypes: LeadType[],
}

export enum LeadType {
    FETCH = "fetch",
    DELIVER = "deliver",
    SEEK = "seek",
    EXTERMINATE = "exterminate",
    PLACATE = "placate",
    NURSE = "nurse",
    DEFEND = "defend",
}

/** Hero Related */

export interface HeroModification {
    type: HeroModificationType,
    attributeName: string,
    data: any,
}

export enum HeroModificationType {
    INCREASE,
    DECREASE,
    SET,
    SET_LOOT_MAJOR_REWARD,
    ADD,
    ADD_STAT,
    ADD_QUANTITY,
    ADD_RANK,
    ADD_TRIAL_MAJOR_REWARD,
    ADD_QUEST_MAJOR_REWARD,
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

    // major rewards
    lootMajorRewards: LootMajorReward[];
    trialMajorRewards: TrialMajorReward[];
    questMajorRewards: QuestMajorReward[];

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
    type: string,
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
    namePlural: string,
    quantity: number,
    value: number,
};

export interface TrialBuildUpReward {
    name: string,
    namePlural: string,
    quantity: number,
    value: number,
};

export interface QuestBuildUpReward {
    questlogName: string,
    taskName: string,
    value: number,
};

export enum TrialMajorRewardType {
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
    trophyNamePlural: string,
}

export interface HeroClass {
    name: string,
    namePlural: string,
}

export interface HeroTitlePosition {
    description: string,
    titleObjectList: string[],
}
