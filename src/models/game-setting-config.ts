import { HeroRace } from "./models";

export interface GameSettingConfig {
    gameSettingId: string,
    gameSettingName: string,
    heroRaces: HeroRace[],
    heroClasses: string[],
    statNames: string[],
}