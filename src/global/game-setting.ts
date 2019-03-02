import { GameSettingConfig, LootMajorRewardMaterialType, LootMajorRewardModifierType, TaskModeData } from "../models/game-setting-models";
import { HeroRace } from "../models/models";
import { AbilityType } from "../models/game-setting-models";
import { PrologueTask, LootMajorRewardType } from "../models/hero-models";

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
    readonly adventureTransitionTaskDescriptions: string[];
    readonly staticNames: string[];
    readonly randomNameParts: string[][];
    readonly lootMajorRewardTypes: LootMajorRewardType[];
    readonly lootMajorRewardMaterialTypes: LootMajorRewardMaterialType[];
    readonly lootMajorRewardModifierTypes: LootMajorRewardModifierType[];
    readonly taskModeData: TaskModeData[];
 


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
        this.adventureTransitionTaskDescriptions = config.adventureTransitionTaskDescriptions;
        this.staticNames = config.staticNames;
        this.randomNameParts = config.randomNameParts;

        if (config.lootMajorRewardTypes.some(et => !config.lootMajorRewardMaterialTypes.some(emt => et.materialType === emt.name))) {
            throw 'At least 1 LootMajorRewardType has invalid LootMajorRewardMaterialType configured in ' + config.gameSettingName;
        }
        this.lootMajorRewardTypes = config.lootMajorRewardTypes;
        if (config.lootMajorRewardMaterialTypes.some(eMatT => eMatT.options.some(eMat => !config.lootMajorRewardModifierTypes.some(eModT => eMat.modifierType === eModT.name)))) {
            throw 'At least 1 LootMajorRewardMaterial has invalid LootMajorRewardModifierType configured in ' + config.gameSettingName;
        }
        this.lootMajorRewardMaterialTypes = config.lootMajorRewardMaterialTypes;
        this.lootMajorRewardModifierTypes = config.lootMajorRewardModifierTypes;
        this.taskModeData = config.taskModeData;
    }
}