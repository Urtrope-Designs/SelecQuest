import { GameSettingConfig, EquipmentMaterialType, EquipmentModifierType } from "../models/game-setting-models";
import { HeroRace } from "../models/models";
import { AbilityType } from "../models/game-setting-models";
import { PrologueTask, EquipmentType } from "../models/hero-models";

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
    readonly equipmentTypes: EquipmentType[];
    readonly equipmentMaterialTypes: EquipmentMaterialType[];
    readonly equipmentModifierTypes: EquipmentModifierType[];
    readonly taskModeData: {
        taskModeActionName: string,
    }[];
 


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

        if (config.equipmentTypes.some(et => !config.equipmentMaterialTypes.some(emt => et.materialType === emt.name))) {
            throw 'At least 1 EquipmentType has invalid EquipmentMaterialType configured in ' + config.gameSettingName;
        }
        this.equipmentTypes = config.equipmentTypes;
        if (config.equipmentMaterialTypes.some(eMatT => eMatT.options.some(eMat => !config.equipmentModifierTypes.some(eModT => eMat.modifierType === eModT.name)))) {
            throw 'At least 1 EquipmentMaterial has invalid EquipmentModifierType configured in ' + config.gameSettingName;
        }
        this.equipmentMaterialTypes = config.equipmentMaterialTypes;
        this.equipmentModifierTypes = config.equipmentModifierTypes;
        this.taskModeData = config.taskModeData;
    }
}