import { HeroRace } from "./models";
import { PrologueTask, LootMajorRewardType } from "./hero-models";

export interface GameSettingConfig {
    gameSettingId: string,
    gameSettingName: string,
    heroRaces: HeroRace[],
    heroClasses: string[],
    statNames: string[],
    healthStatName: string,         // 1-8 chars
    healthBaseStatIndex: number,    // number between 0 and 5 inclusive
    magicStatName: string,          // 1-8 chars
    magicBaseStatIndex: number,     // number between 0 and 5 inclusive
    abilityTypes: AbilityType[],
    prologueAdventureName: string,
    prologueTasks: PrologueTask[],
    adventureTransitionTaskDescriptions: string[],
    staticNames: string[],
    randomNameParts: string[][],
    lootMajorRewardTypes: LootMajorRewardType[],
    lootMajorRewardMaterialTypes: LootMajorRewardMaterialType[],
    lootMajorRewardModifierTypes: LootMajorRewardModifierType[],
    taskModeData: {
        taskModeActionName: string,
    }[],
}

export interface AbilityType {
    displayName: string;
    baseStatIndex: number;
    availableValues: string[];
}

export interface LootMajorRewardMaterial {
    name: string,
    baseLevel: number,
    modifierType: string,
}

export interface LootMajorRewardMaterialType {
    name: string,
    options: LootMajorRewardMaterial[],
}

export interface LootMajorRewardModifier {
    name: string,
    levelModifier: number,
}

export interface LootMajorRewardModifierType {
    name: string,
    options: LootMajorRewardModifier[],
}