import { GameSettingConfig } from "../models/game-setting-config";
import { CharRace } from "../models/models";

export class GameSetting {
    readonly gameSettingId: string;
    readonly gameSettingName: string;
    readonly charRaces: CharRace[];
    readonly charClasses: string[];
    readonly statNames: string[];

    constructor(config: GameSettingConfig) {
        // todo: TYPE CHECK THE CONFIG, and handle any problems
        this.gameSettingId = config.gameSettingId;
        this.gameSettingName = config.gameSettingName;
        this.charRaces = config.charRaces;
        this.charClasses = config.charClasses;
        this.statNames = config.statNames;
    }
}