import { HeroRace } from "./models";

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
}