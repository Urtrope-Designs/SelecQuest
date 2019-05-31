import { HeroRace, TaskTarget, LeadGatheringTarget, TaskTargetType, HeroTitlePosition, HeroClass, LeadTarget } from "./models";
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
    randomNameParts: string[];
    basicTaskTargets: TaskTarget[];
    lootMajorRewardTypes: LootMajorRewardType[];
    lootMajorRewardMaterialTypes: LootMajorRewardMaterialType[];
    lootMajorRewardModifierTypes: LootMajorRewardModifierType[];
    trialMajorRewardTypes: string[];
    questMajorRewardGroups: QuestMajorRewardGroup[];
    epithetDescriptors: string[];
    epithetBeingAll: string[];
    titlePositionsAll: HeroTitlePosition[];
    sobriquetModifiers: string[];
    sobriquetNounPortions: string[];
    honorificTemplates: string[];
    leadGatheringTargets: LeadGatheringTarget[];
    leadTargets: LeadTarget[];
    officePositionsAll: string[];
    officeIterationName: string;
    taskModeData: TaskModeData[];
    gameViewTabDisplayNames: string[];          // length of array must be 5, each string must be 8 or fewer characters
    locationTaskGerund: string;
    foeTaskGerund: string;
    duelTaskGerund: string;
    trialTaskGerund: string;
    taskPrefixes: TaskPrefix[];
    nameSources: NameSource[];
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

export interface NameSource {
    source: string;
    options: string[];
}

export interface QuestMajorRewardGroup {
    groupName: string;
    topOfficeName: string;
}
