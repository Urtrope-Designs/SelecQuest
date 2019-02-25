import { HeroRace } from "./models";
import { PrologueTask } from "./hero-models";

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
}

export interface AbilityType {
    displayName: string;
    baseStatIndex: number;
    availableValues: string[];
}