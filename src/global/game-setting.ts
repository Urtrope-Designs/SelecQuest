import { GameSettingConfig } from "../models/game-setting-models";
import { HeroRace } from "../models/models";
import { AbilityType } from "../models/game-setting-models";
import { PrologueTask } from "../models/hero-models";

export class GameSetting {
    readonly gameSettingId: string;
    readonly gameSettingName: string;
    readonly heroRaces: HeroRace[];
    readonly heroClasses: string[];
    readonly statNames: string[];
    readonly healthStatName: string;            // 1-8 chars
    readonly healthBaseStatIndex: number;                // number between 0 and 5 inclusive
    readonly magicStatName: string;                      // 1-8 chars
    readonly magicBaseStatIndex: number;                 // number between 0 and 5 inclusive
    readonly abilityTypes: AbilityType[];
    readonly prologueAdventureName: string;
    readonly prologueTasks: PrologueTask[];



    constructor(config: GameSettingConfig) {
        // todo: TYPE CHECK THE CONFIG, and handle any problems
        this.gameSettingId = config.gameSettingId;
        this.gameSettingName = config.gameSettingName;
        this.heroRaces = config.heroRaces;
        this.heroClasses = config.heroClasses;
        this.statNames = config.statNames;
        this.healthStatName = config.healthStatName;
        this.healthBaseStatIndex = config.healthBaseStatIndex;
        this.magicStatName = config.magicStatName;
        this.magicBaseStatIndex = config.magicBaseStatIndex;
        this.abilityTypes = config.abilityTypes;
        this.prologueAdventureName = config.prologueAdventureName;
        this.prologueTasks = config.prologueTasks;
    }
}