import { HeroRace, LootingTarget, TrialTarget, LeadGatheringTarget, TaskTargetType, HeroTitlePosition, HeroClass } from "./models";
import { PrologueTask, LootMajorRewardType } from "./hero-models";

export interface GameSettingConfig {
    gameSettingId: string;
    gameSettingName: string;
    heroRaces: HeroRace[];
    heroClasses: HeroClass[];
    statNames: string[];
    healthStatName: string;         // 1-8 chars
    healthBaseStatIndex: number;    // number between 0 and 5 inclusive
    magicStatName: string;          // 1-8 chars
    magicBaseStatIndex: number;     // number between 0 and 5 inclusive
    abilityTypes: AbilityType[];
    prologueAdventureName: string;
    prologueTasks: PrologueTask[];
    adventureTransitionTaskDescriptions: string[];
    staticNames: string[];
    randomNameParts: string[][];
    lootTaskTargets: LootingTarget[];
    lootMajorRewardTypes: LootMajorRewardType[];
    lootMajorRewardMaterialTypes: LootMajorRewardMaterialType[];
    lootMajorRewardModifierTypes: LootMajorRewardModifierType[];
    trialTaskTargets: TrialTarget[];
    trialMajorRewardTypes: string[];
    epithetDescriptors: string[];
    epithetBeingAll: string[];
    titlePositionsAll: HeroTitlePosition[];
    sobriquetModifiers: string[];
    sobriquetNounPortions: string[];
    honorificTemplates: string[];
    leadGatheringTargets: LeadGatheringTarget[];
    officePositionsAll: string[];
    taskModeData: TaskModeData[];
    gameViewTabDisplayNames: string[];          // length of array must be 5, each string must be 8 or fewer characters
    fetchTargetObjects: string[];
    seekTargetObjects: string[];
    places: string[];
    groups: string[];
    locationTaskGerund: string;
    foeTaskGerund: string;
    duelTaskGerund: string;
    trialTaskGerund: string;
    taskPrefixes: TaskPrefix[];
}

export interface AbilityType {
    displayName: string;
    baseStatIndex: number;
    availableValues: string[];
}

export interface LootMajorRewardMaterial {
    name: string;
    baseLevel: number;
    modifierType: string;
}

export interface LootMajorRewardMaterialType {
    name: string;
    options: LootMajorRewardMaterial[];
}

export interface LootMajorRewardModifier {
    name: string;
    levelModifier: number;
}

export interface LootMajorRewardModifierType {
    name: string;
    options: LootMajorRewardModifier[];
}

export interface TaskModeData {
    taskModeActionName: string;
    isCurrencyCumulative: boolean;
    buildUpLimitBaseStatIndex: number;
    environmentalLimitBaseStatIndex: number;
    majorRewardDisplayName: string[];       // must have length of 1 for Loot & Trial modes, length of 4 for Quest mode
    currencyDisplayName: string;
    buildUpLimitDisplayName: string;
    buildUpRewardDisplayName: string;
    environmentalLimitDisplayName: string;
    environmentalLimitBreakDisplayName: string;
    startBuildUpTaskDescriptionOptions: string[];
    startTearDownTaskDescriptionOptions: string[];
    earnMajorRewardTaskDescriptionOptions: string[];
};

export interface TaskPrefix {
    options: string[];
    taskTargetType: TaskTargetType;
    degree: 'minimal' | 'maximal' | 'bad first' | 'bad second' | 'good first' | 'good second';
}
