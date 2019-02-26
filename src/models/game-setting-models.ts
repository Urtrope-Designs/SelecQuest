import { HeroRace } from "./models";
import { PrologueTask, EquipmentType } from "./hero-models";

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
    equipmentTypes: EquipmentType[],
    equipmentMaterialTypes: EquipmentMaterialType[],
    equipmentModifierTypes: EquipmentModifierType[],
    taskModeNames: string[],
}

export interface AbilityType {
    displayName: string;
    baseStatIndex: number;
    availableValues: string[];
}

export interface EquipmentMaterial {
    name: string,
    baseLevel: number,
    modifierType: string,
}

export interface EquipmentMaterialType {
    name: string,
    options: EquipmentMaterial[],
}

export interface EquipmentModifier {
    name: string,
    levelModifier: number,
}

export interface EquipmentModifierType {
    name: string,
    options: EquipmentModifier[],
}