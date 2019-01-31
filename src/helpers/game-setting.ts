import { GameSettingConfig } from "../models/game-setting-config";
import { HeroRace } from "../models/models";

export class GameSetting {
    readonly gameSettingId: string;
    readonly gameSettingName: string;
    readonly heroRaces: HeroRace[];
    readonly heroClasses: string[];
    readonly statNames: string[];

    constructor(config: GameSettingConfig) {
        // todo: TYPE CHECK THE CONFIG, and handle any problems
        this.gameSettingId = config.gameSettingId;
        this.gameSettingName = config.gameSettingName;
        this.heroRaces = config.heroRaces;
        this.heroClasses = config.heroClasses;
        this.statNames = config.statNames;
    }
}