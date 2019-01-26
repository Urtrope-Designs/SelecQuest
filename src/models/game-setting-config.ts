import { CharRace } from "./models";

export interface GameSettingConfig {
    gameSettingId: string,
    gameSettingName: string,
    charRaces: CharRace[],
    charClasses: string[],
    statNames: string[],
}