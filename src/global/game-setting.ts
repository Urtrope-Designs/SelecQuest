import { GameSettingConfig, LootMajorRewardMaterialType, LootMajorRewardModifierType, TaskModeData, TaskPrefix } from "../models/game-setting-models";
import { HeroRace, LootingTarget, TrialTarget, LeadGatheringTarget, HeroTitlePosition } from "../models/models";
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
    readonly lootTaskTargets: LootingTarget[];
    readonly lootMajorRewardTypes: LootMajorRewardType[];
    readonly lootMajorRewardMaterialTypes: LootMajorRewardMaterialType[];
    readonly lootMajorRewardModifierTypes: LootMajorRewardModifierType[];
    readonly gameViewTabDisplayNames: string[];
    readonly taskModeData: TaskModeData[];
    readonly fetchTargetObjects: string[];
    readonly seekTargetObjects: string[];
    readonly places: string[];
    readonly locationTaskGerund: string;
    readonly foeTaskGerund: string;
    readonly duelTaskGerund: string;
    readonly trialTaskGerund: string;
    readonly trialTaskTargets: TrialTarget[];
    readonly trialMajorRewardTypes: string[];
    readonly epithetDescriptors: string[];
    readonly epithetBeingAll: string[];
    readonly titlePositionsAll: HeroTitlePosition[];
    readonly leadGatheringTargets: LeadGatheringTarget[];
    readonly taskPrefixes: TaskPrefix[];



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
        this.lootTaskTargets = config.lootTaskTargets;

        if (config.lootMajorRewardTypes.some(et => !config.lootMajorRewardMaterialTypes.some(emt => et.materialType === emt.name))) {
            throw 'At least 1 LootMajorRewardType has invalid LootMajorRewardMaterialType configured in ' + config.gameSettingName;
        }
        this.lootMajorRewardTypes = config.lootMajorRewardTypes;
        if (config.lootMajorRewardMaterialTypes.some(eMatT => eMatT.options.some(eMat => !config.lootMajorRewardModifierTypes.some(eModT => eMat.modifierType === eModT.name)))) {
            throw 'At least 1 LootMajorRewardMaterial has invalid LootMajorRewardModifierType configured in ' + config.gameSettingName;
        }
        this.lootMajorRewardMaterialTypes = config.lootMajorRewardMaterialTypes;
        this.lootMajorRewardModifierTypes = config.lootMajorRewardModifierTypes;

        this.trialTaskTargets = config.trialTaskTargets;

        if(config.trialMajorRewardTypes.length != 4) {
            throw 'Length of trialMajorRewardTypes array not equal to 4 in ' + config.gameSettingName;
        }
        this.trialMajorRewardTypes = config.trialMajorRewardTypes;
        this.epithetDescriptors = config.epithetDescriptors;
        this.epithetBeingAll = config.epithetBeingAll;
        this.titlePositionsAll = config.titlePositionsAll;
        this.leadGatheringTargets = config.leadGatheringTargets;

        if (config.gameViewTabDisplayNames.length != 5) {
            throw 'Length of gameViewTabDisplayNames array not equal to 5 in ' + config.gameSettingName;
        }
        if (config.gameViewTabDisplayNames.some(name => name.length > 8)) {
            throw 'At least one gameViewTabDisplayName longer than 8 characters in ' + config.gameSettingName;
        }
        this.gameViewTabDisplayNames = config.gameViewTabDisplayNames;

        /** Validating taskModeData */
        if (config.taskModeData[0].majorRewardDisplayName.length != 1 || config.taskModeData[1].majorRewardDisplayName.length != 1 || config.taskModeData[2].majorRewardDisplayName.length != 4) {
            throw 'Must have exactly 1 MajorRewardDisplayName for LOOT mode and TRIAL mode, and exactly 4 MajorRewardDisplayName for QUEST mode; in ' + config.gameSettingName;
        }
        this.taskModeData = config.taskModeData;

        this.fetchTargetObjects = config.fetchTargetObjects;
        this.seekTargetObjects = config.seekTargetObjects;
        this.places = config.places;
        this.locationTaskGerund = config.locationTaskGerund;
        this.foeTaskGerund = config.foeTaskGerund;
        this.duelTaskGerund = config.duelTaskGerund;
        this.trialTaskGerund = config.trialTaskGerund;
        this.taskPrefixes = config.taskPrefixes;
    }
}