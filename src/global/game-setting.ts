import { GameSettingConfig, LootMajorRewardMaterialType, LootMajorRewardModifierType, TaskModeData, TaskPrefix, NameSource, QuestMajorRewardGroup, TrialCompetitiveClass, TrialRankingSystem } from "../models/game-setting-models";
import { HeroRace, TaskTarget, LeadGatheringTarget, HeroClass, TaskTargetType, LeadTarget } from "../models/models";
import { AbilityType } from "../models/game-setting-models";
import { PrologueTask, LootMajorRewardType } from "../models/hero-models";
import { randFromList, makeStringIndefinite } from "./utils";

export class GameSetting {
    readonly gameSettingId: string;
    readonly gameSettingName: string;
    readonly heroRaces: HeroRace[];
    readonly heroClasses: HeroClass[];
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
    readonly basicTaskTargets: TaskTarget[];
    readonly lootMajorRewardTypes: LootMajorRewardType[];
    readonly lootMajorRewardMaterialTypes: LootMajorRewardMaterialType[];
    readonly lootMajorRewardModifierTypes: LootMajorRewardModifierType[];
    readonly gameViewTabDisplayNames: string[];
    readonly taskModeData: TaskModeData[];
    readonly locationTaskGerund: string;
    readonly foeTaskGerund: string;
    readonly duelTaskGerund: string;
    readonly trialTaskGerund: string;
    readonly trialMajorRewardTypes: string[];
    readonly trialCompetitiveClasses: TrialCompetitiveClass[];
    readonly trialRankingSystems: TrialRankingSystem[];
    readonly epithetDescriptors: string[];
    readonly epithetBeingAll: string[];
    readonly sobriquetModifiers: string[];
    readonly sobriquetNounPortions: string[];
    readonly questMajorRewardGroups: QuestMajorRewardGroup[];
    readonly leadGatheringTargets: LeadGatheringTarget[];
    readonly leadTargets: LeadTarget[];
    readonly officePositionsAll: string[];
    readonly officeIterationName: string;
    readonly taskPrefixes: TaskPrefix[];
    readonly nameSources: NameSource[];



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
        this.randomNameParts = config.randomNameParts.map(partsList => partsList.split('|'));
        this.basicTaskTargets = config.basicTaskTargets;

        if (config.lootMajorRewardTypes.some(et => !config.lootMajorRewardMaterialTypes.some(emt => et.materialType === emt.name))) {
            throw 'At least 1 LootMajorRewardType has invalid LootMajorRewardMaterialType configured in ' + config.gameSettingName;
        }
        this.lootMajorRewardTypes = config.lootMajorRewardTypes;
        if (config.lootMajorRewardMaterialTypes.some(eMatT => eMatT.options.some(eMat => !config.lootMajorRewardModifierTypes.some(eModT => eMat.modifierType === eModT.name)))) {
            throw 'At least 1 LootMajorRewardMaterial has invalid LootMajorRewardModifierType configured in ' + config.gameSettingName;
        }
        this.lootMajorRewardMaterialTypes = config.lootMajorRewardMaterialTypes;
        this.lootMajorRewardModifierTypes = config.lootMajorRewardModifierTypes;

        if(config.trialMajorRewardTypes.length != 2) {
            throw 'Length of trialMajorRewardTypes array not equal to 2 in ' + config.gameSettingName;
        }
        this.trialMajorRewardTypes = config.trialMajorRewardTypes;
        this.trialCompetitiveClasses = config.trialCompetitiveClasses;
        this.trialRankingSystems = config.trialRankingSystems;
        this.epithetDescriptors = config.epithetDescriptors;
        this.epithetBeingAll = config.epithetBeingAll;
        this.sobriquetModifiers = config.sobriquetModifiers;
        this.sobriquetNounPortions = config.sobriquetNounPortions;
        
        this.questMajorRewardGroups = config.questMajorRewardGroups;
        this.leadGatheringTargets = config.leadGatheringTargets;
        this.leadTargets = config.leadTargets;
        this.officePositionsAll = config.officePositionsAll;
        this.officeIterationName = config.officeIterationName;

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

        this.locationTaskGerund = config.locationTaskGerund;
        this.foeTaskGerund = config.foeTaskGerund;
        this.duelTaskGerund = config.duelTaskGerund;
        this.trialTaskGerund = config.trialTaskGerund;
        this.taskPrefixes = config.taskPrefixes;

        // need to add validation to EVERYTHING that could use a NameSource??
        this.nameSources = config.nameSources;
    }

    /**
     * 
     * @param sourceString string that may potentially contain template markers
     * 
     * Template Markers are surrounded by the "%" character. If a list exists in this.nameSources with a "source" attribute matching the Template Marker, 
     * an option from that nameSource's "options" array will be used to replace it. Prefixing the Template Marker with "INDEF_" will cause the result
     * to be passed through the util function "makeIndefinite" before replacing.
     * Additionally, the static Template Markers "FOE", "LOCATION", and "TRIAL" can be used to pull random results from the filtered lists of names
     * from this.basicTaskTargets where "type" matches the Template Marker. In addition to the "INDEF_" prefix, these Template Markers can make use of
     * the prefix "PLURAL_" to use the corresponding "namePlural" attribute instead of "name".
     * Static template marker "QUESTGROUPS" will pull from the "groupName" attribute of the "questMajorRewardGroups" array.
     */
    public hydrateFromNameSources(sourceString: string): string {
        const indefPrefix = 'INDEF_';
        const pluralPrefix = 'PLURAL_';
        const requestedSources = sourceString.match(/%[a-zA-Z_]+%/g);
        if (requestedSources == null) {
            return sourceString;
        } else {
            let hydratedString = sourceString;
            requestedSources.forEach((marker: string) => {
                let makeIndef = false;
                let makePlural = false;

                let source = marker.slice(1, -1);
                if (source.includes(indefPrefix)) {
                    makeIndef = true;
                    source = source.replace(indefPrefix, '');
                }
                if (source.includes(pluralPrefix)) {
                    makePlural = true;
                    source = source.replace(pluralPrefix, '');
                }

                // determine the replacement value
                let replacementValue = '';

                const matchedTaskType = TaskTargetType[source.toLocaleUpperCase()];
                if (!!matchedTaskType) {
                    // pull from basicTaskTargets
                    const replacementTaskTarget = randFromList(this.basicTaskTargets.filter(t => t.type == matchedTaskType));

                    replacementValue = makePlural ? replacementTaskTarget.namePlural : replacementTaskTarget.name;

                    if (makeIndef) {
                        replacementValue = 'some ' + replacementValue;
                    }
                } else if (source.toLocaleLowerCase() === 'questgroups') {
                    const replacementGroupName = randFromList(this.questMajorRewardGroups).groupName;
                    
                    // can't make plural or indefinite
                    replacementValue = replacementGroupName;
                } else {
                    // pull from nameSources
                    const matchedSource = this.nameSources.find(ns => ns.source == source);
                    
                    if (matchedSource != null) {
                        replacementValue = randFromList(matchedSource.options);

                        if (makeIndef) {
                            replacementValue = makeStringIndefinite(replacementValue, 1);
                        }
                    } else {
                        // make for easier debugging if invalid marker is used
                        replacementValue = marker;
                    }
                }

                // swap out the source placeholders with the replacement values                
                hydratedString = hydratedString.replace(marker, replacementValue);
            })

            return hydratedString;
        }
    }
}
