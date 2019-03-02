import { GameSettingsManager } from "./game-settings-manager";
import { Adventure, HeroAbilityType, LootMajorRewardType, LootMajorReward } from "../models/hero-models";
import { IS_DEBUG, EPITHET_DESCRIPTORS, EPITHET_BEING_ALL, TITLE_POSITIONS_ALL, SOBRIQUET_MODIFIERS, SOBRIQUET_NOUN_PORTION, HONORIFIC_TEMPLATES, STANDARD_GROUPS_INDEFINITE, OFFICE_POSITIONS_ALL } from "../global/config";
import { Hero, HeroModification, HeroModificationType, TrialMajorReward, TrialMajorRewardType, HeroTitlePosition, QuestMajorReward, HeroConnection, HeroStat } from "../models/models";
import { randRange, randFromList, randFromListLow, getIterableEnumKeys, capitalizeInitial, randFromListHigh, generateRandomName } from "../global/utils";

export class PlayTaskResultGenerator {
    constructor(private gameSettingsMgr: GameSettingsManager) {
    }

    private generateNextAdventure(completedAdventure: Adventure): Adventure {
        const oldChapNumMatch = completedAdventure.name.match(/\d+$/);
        const oldChapNum = !!oldChapNumMatch ? +oldChapNumMatch[0] : 0;
        const newChapDuration = IS_DEBUG ? 60 : (60 * 60 * (1 + 5 * oldChapNum + 1));
        return {name: `Chapter ${oldChapNum + 1}`, progressRequired: newChapDuration};
    }
    
    public generateNewAdventureResults(currentHero: Hero, includeReward: boolean = true): HeroModification[] {
        let results = [
            {
                type: HeroModificationType.SET,
                attributeName: 'currentAdventure',
                data: this.generateNextAdventure(currentHero.currentAdventure),
            },
            {
                type: HeroModificationType.SET,
                attributeName: 'adventureProgress',
                data: 0,
            },
            {
                type: HeroModificationType.ADD,
                attributeName: 'completedAdventures',
                data: [currentHero.currentAdventure.name],
            },
        ];
        if (includeReward) {
            results.push(randRange(0, 1) ? this.generateNewLootMajorRewardModification(currentHero) : this.generateAbilityModification(currentHero));
        }
        return results;
    }
    
    private generateAbilityModification(hero: Hero, modValue: number = 1): HeroModification {
        const curGameSetting = this.gameSettingsMgr.getGameSettingById(hero.gameSettingId);
        const newAbilityType = randFromList(curGameSetting.abilityTypes);
        // pick a spell/ability early in the list, weighted toward 0
        const dataObj: HeroAbilityType = {
            name: newAbilityType.displayName,
            received: [
                {
                    name: randFromListLow(newAbilityType.availableValues, 2, hero.level + hero.stats[newAbilityType.baseStatIndex].value),
                    rank: modValue
                }
            ]
        };
        
        const mod: HeroModification = {
            type: HeroModificationType.ADD_RANK,
            attributeName: 'abilities',
            data: dataObj,
        }
        
        return mod;
    }
    
    public generateNewLootMajorRewardModification(hero: Hero): HeroModification {
        const newLootMajorRewardData = this.generateRandomLootMajorReward(hero);
        
        const mod: HeroModification = {
            type: HeroModificationType.SET_LOOT_MAJOR_REWARD,
            attributeName: 'lootMajorRewards',
            data: [newLootMajorRewardData],
        };
    
        return mod;
    }
    
    private generateRandomLootMajorReward(hero: Hero): LootMajorReward {
        const gameSetting = this.gameSettingsMgr.getGameSettingById(hero.gameSettingId);
        const targetLevel = hero.level;
        //     randomly pick LootMajorReward type
        const newLootMajorRewardType: LootMajorRewardType = randFromList(gameSetting.lootMajorRewardTypes);
        // 2. randomly pick 5 items of selected LootMajorReward type, & pick the one closest to hero level
        const targetList = gameSetting.lootMajorRewardMaterialTypes.find(emt => emt.name == newLootMajorRewardType.materialType).options;
        
        let material = randFromList(targetList);
        for (let i = 0; i <= 5; i++) {
            let compare = randFromList(targetList);
            if (Math.abs(targetLevel - material.baseLevel) > Math.abs(targetLevel - compare.baseLevel)) {
                material = compare;
            }
        }
    
        // 3. add up to 2 modifiers (no duplicates) to bring quality of selected item closer to hero level (don't allow it to go over)
        let qualityDifference = targetLevel - material.baseLevel;
        let newLootMajorRewardDescription = material.name;
        const modifierList = gameSetting.lootMajorRewardModifierTypes.find(emt => emt.name === material.modifierType).options
            .filter(i => qualityDifference > 0 ? i.levelModifier >= 0 : i.levelModifier < 0);
        for (let i = 0; i < 2 && qualityDifference != 0; i++) {
            const modifier = randFromList(modifierList);
            if (newLootMajorRewardDescription.includes(modifier.name)) {
                //no repeats
                break;
            }
            if (Math.abs(qualityDifference) < Math.abs(modifier.levelModifier)) {
                // too much
                break;
            }
    
            newLootMajorRewardDescription = `${modifier.name} ${newLootMajorRewardDescription}`;
            qualityDifference -= modifier.levelModifier;
        }
        
        // 4. add remainder of difference (between quality of item adjusted by mods and hero level) as numeric modifier.
        if (qualityDifference != 0) {
            newLootMajorRewardDescription = `${qualityDifference > 0 ? '+' : ''}${qualityDifference} ${newLootMajorRewardDescription}`;
        }
    
        const newLootMajorReward: LootMajorReward = {
            type: newLootMajorRewardType.name,
            description: newLootMajorRewardDescription,
        };
    
        return newLootMajorReward;
    }
    
    public generateNewTrialMajorRewardModification(hero: Hero): HeroModification {
        const newTrialMajorRewardData = this.generateRandomTrialMajorReward(hero);
        
        const mod: HeroModification = {
            type: HeroModificationType.ADD_TRIAL_MAJOR_REWARD,
            attributeName: 'trialMajorRewards',
            data: [newTrialMajorRewardData],
        };
    
        return mod;
    }
    
    private generateRandomTrialMajorReward(hero: Hero): TrialMajorReward {
        const newTrialMajorRewardType = TrialMajorRewardType[randFromList(getIterableEnumKeys(TrialMajorRewardType))];
        let newTrialMajorRewardDescription = '';
        let exclusions: string = '';
        switch(newTrialMajorRewardType) {
            case TrialMajorRewardType.Epithets:
                exclusions = hero.trialMajorRewards.find(reward => reward.type == TrialMajorRewardType.Epithets).received.join(' ');
                newTrialMajorRewardDescription = this.generateRandomEpithetDescription(exclusions);
                break;
            case TrialMajorRewardType.Titles:
                exclusions = hero.trialMajorRewards.find(reward => reward.type == TrialMajorRewardType.Titles).received.join(' ');
                newTrialMajorRewardDescription = this.generateRandomTitleDescription(exclusions);
                break;
                case TrialMajorRewardType.Sobriquets:
                exclusions = hero.trialMajorRewards.find(reward => reward.type == TrialMajorRewardType.Sobriquets).received.join(' ');
                newTrialMajorRewardDescription = this.generateRandomSobriquetDescription(exclusions);
                break;
                case TrialMajorRewardType.Honorifics:
                exclusions = hero.trialMajorRewards.find(reward => reward.type == TrialMajorRewardType.Honorifics).received.join(' ');
                newTrialMajorRewardDescription = this.generateRandomHonorificDescription(exclusions, hero.level, hero.name);
                break;
        }
    
        const newTrialMajorReward = {
            type: newTrialMajorRewardType,
            received: [newTrialMajorRewardDescription]
        }
    
        return newTrialMajorReward;
    }
    
    private generateRandomEpithetDescription(exclusions: string) {
        let epithetDescriptor: string;
        let epithetBeing: string;
    
        do {
            epithetDescriptor = randFromList(EPITHET_DESCRIPTORS);
        } while (exclusions.toLocaleLowerCase().includes(epithetDescriptor.toLocaleLowerCase()));
        do {
            epithetBeing = randFromList(EPITHET_BEING_ALL);
        } while (exclusions.toLocaleLowerCase().includes(epithetBeing.toLocaleLowerCase()));
    
        let epithetDescription = `${epithetDescriptor} ${epithetBeing}`;
        return epithetDescription;
    };
    private generateRandomTitleDescription(exclusions: string) {
        let titlePosition: HeroTitlePosition;
        let titleObject: string;
        do {
            titlePosition = randFromList(TITLE_POSITIONS_ALL);
        } while (exclusions.toLocaleLowerCase().includes(titlePosition.description.toLocaleLowerCase()));
        do {
            titleObject = randFromList(titlePosition.titleObjectList);
        } while (exclusions.toLocaleLowerCase().includes(titleObject.toLocaleLowerCase()));
    
        const titleDescription = `${titlePosition.description} of ${titleObject}`;
    
        return titleDescription;
    }
    private generateRandomSobriquetDescription(exclusions: string) {
        let modifier = ''
        do {
            modifier = randFromList(SOBRIQUET_MODIFIERS);
        } while (exclusions.toLocaleLowerCase().includes(modifier.toLocaleLowerCase()));
    
        // one or two (twice as likely) SOBRIQUET_NOUN_PORTIONs
        let noun = '';
        for (let i = 0; i < (randRange(0, 2) || 2); i++) {
            let nounPortion = '';
            do {
                nounPortion = randFromList(SOBRIQUET_NOUN_PORTION);
            } while (exclusions.toLocaleLowerCase().includes(nounPortion.toLocaleLowerCase()) || noun.toLocaleLowerCase().includes(nounPortion.toLocaleLowerCase()));
            noun += nounPortion;
        }
    
        const sobriquetDescription = `${modifier} ${capitalizeInitial(noun)}`;
        return sobriquetDescription;
    }
    private generateRandomHonorificDescription(exclusions: string, targetLevel: number, heroName: string) {
        let honorificTemplate: string;
        let honorificDescription: string;
        
        const deviation = 4;
        const minIndex = Math.min(targetLevel - deviation, HONORIFIC_TEMPLATES.length - deviation);
        const maxIndex = Math.max(targetLevel + deviation, deviation);
        do {
            honorificTemplate = randFromListHigh(HONORIFIC_TEMPLATES, 1, minIndex, maxIndex);
            honorificDescription = honorificTemplate.replace('%NAME%', heroName);
        } while (exclusions.toLocaleLowerCase().includes(honorificDescription.toLocaleLowerCase()));
        
        return honorificDescription;
    }
    
    public generateNewQuestMajorRewardModification(hero: Hero): HeroModification {
        const newQuestMajorRewardData = this.generateRandomQuestMajorReward(hero);
    
        const mod = {
            type: HeroModificationType.ADD_QUEST_MAJOR_REWARD,
            attributeName: 'questMajorRewards',
            data: [newQuestMajorRewardData],
        };
    
        return mod;
    }
    
    private generateRandomQuestMajorReward(hero: Hero): QuestMajorReward {
        let newRewardData: QuestMajorReward;
    
        let newRewardFactories: ((hero: Hero) => QuestMajorReward)[] = [];
        if (hero.questMajorRewards.length < STANDARD_GROUPS_INDEFINITE.length) {
            newRewardFactories.push(this.generateRandomDistinctConnection);
            newRewardFactories.push(this.generateRandomDistinctConnection); // double the odds
        }
        if (hero.questMajorRewards.some(a => a.office == null)) {
            newRewardFactories.push(this.generateRandomDistinctMembership);
            newRewardFactories.push(this.generateRandomDistinctMembership); // double the odds
        }
        if (hero.questMajorRewards.some(a => this.isNonNullNonHighestOffice(a.office))) {
            newRewardFactories.push(this.generateRandomDistinctHigherOffice);
        }
    
        
        let selectedFactory = randFromList(newRewardFactories);
        newRewardData = selectedFactory.bind(this)(hero);
    
        return newRewardData;
    }
    
    
    private generateRandomDistinctConnection(hero: Hero): QuestMajorReward {
        const availableDistinctGroups: string[] = STANDARD_GROUPS_INDEFINITE.filter((groupName: string) => {
            return !hero.questMajorRewards.some(a => a.groupName == groupName);
        });
    
        if (availableDistinctGroups.length === 0) {
            return nullQuestMajorReward;
        }
        
        const newConnectionName = generateRandomName(this.gameSettingsMgr.getGameSettingById(hero.gameSettingId));
        const newConnectionTitle = randFromList(OFFICE_POSITIONS_ALL.slice(1));
        const newGroupName = randFromList(availableDistinctGroups);
        const newConnection: HeroConnection = {
            personName: newConnectionName,
            personTitle: newConnectionTitle,
        }
        const returnData: QuestMajorReward = {
            groupName: newGroupName,
            connection: newConnection,
            office: null,
        }
        return returnData;
    }
    
    private generateRandomDistinctMembership(hero: Hero): QuestMajorReward {
        // list of all groups we have a connection with but don't currently have membership (ie, an office)
        const availableMembershipGroups: string[] = hero.questMajorRewards.filter(a => a.office == null).map(a => a.groupName);
    
        if (availableMembershipGroups.length === 0) {
            return nullQuestMajorReward;
        }
    
        const newMembershipGroupName = randFromList(availableMembershipGroups);
        const newOffice = OFFICE_POSITIONS_ALL[0];
        const returnData: QuestMajorReward = {
            groupName: newMembershipGroupName,
            office: newOffice,
            connection: null,
        }
        return returnData;
    }
    
    private generateRandomDistinctHigherOffice(hero: Hero): QuestMajorReward {
        // list of all groups with a non-null office that is also not the highest office
        const availableOfficeGroups: string[] = hero.questMajorRewards.filter(a => this.isNonNullNonHighestOffice(a.office)).map(a => a.groupName);
        if (availableOfficeGroups.length === 0) {
            return nullQuestMajorReward;
        }
        const group = randFromList(availableOfficeGroups);
        
        const existingReward: QuestMajorReward = hero.questMajorRewards.find(a => a.groupName == group);
        // list of all positions higher than currently "held" office, non-dup with the same group's Connection
        const availableOfficePositions: string[] = OFFICE_POSITIONS_ALL.slice(OFFICE_POSITIONS_ALL.indexOf(existingReward.office) + 1).filter(o => {
                return o != existingReward.connection.personTitle;
            });
        
        const newOffice = randFromListLow(availableOfficePositions, 3);
        const returnData: QuestMajorReward = {
            groupName: group,
            office: newOffice,
            connection: null,
        }
        return returnData;
    }
    
    private isNonNullNonHighestOffice(officeName: string) {
        return !!officeName && OFFICE_POSITIONS_ALL.indexOf(officeName) < (OFFICE_POSITIONS_ALL.length - 1)
    }

    public generateLevelUpModifications(hero: Hero): HeroModification[] {
        const curGameSetting = this.gameSettingsMgr.getGameSettingById(hero.gameSettingId);
    
        let levelMods = [];
        
        levelMods.push({
            type: HeroModificationType.INCREASE,
            attributeName: 'level',
            data: 1,
        });
        levelMods.push({
            type: HeroModificationType.SET,
            attributeName: 'currentXp',
            data: 0,
        })
        levelMods.push({
            type: HeroModificationType.ADD_STAT,
            attributeName: 'maxHealthStat',
            data: [{
                name: curGameSetting.healthStatName,
                value: Math.floor(hero.stats[curGameSetting.healthBaseStatIndex].value / 3) + 1 + randRange(0, 3)
            }],
        });
        levelMods.push({
            type: HeroModificationType.ADD_STAT,
            attributeName: 'maxMagicStat',
            data:[{
                name: curGameSetting.magicStatName,
                value: Math.floor(hero.stats[curGameSetting.magicBaseStatIndex].value / 3 ) + 1 + randRange(0, 3)
            }],
        })
        const winStat1 = this.selectLevelBonusStatIndex(hero.stats);
        const winStat2 = this.selectLevelBonusStatIndex(hero.stats);
        const winStat1Name = curGameSetting.statNames[winStat1];
        const winStat2Name = curGameSetting.statNames[winStat2];
        if (winStat1 === winStat2) {
            levelMods.push(this.generateStatModification([{name: winStat1Name, value: 2}]));
        } else {
            levelMods.push(this.generateStatModification([{name: winStat1Name, value: 1}, {name: winStat2Name, value: 1}]));
        }
        levelMods.push(this.generateAbilityModification(hero));
        
        return levelMods;
    }
    
    private selectLevelBonusStatIndex(heroStats: HeroStat[]): number {
        let selectedStatIndex: number;
        selectedStatIndex = randRange(0, heroStats.length-1);
        
        if (randRange(0, 1)) {
            // Favor the best stat so it will tend to clump
            let i = 0;
            heroStats.forEach(stat => {
                i += stat.value ** 2;
            })
            i = randRange(0, i-1);
            heroStats.some((stat, index) => {
                selectedStatIndex = index;
                i -= stat.value ** 2;
                if (i < 0) {
                    return true;
                }
            });
        }
        
        return selectedStatIndex;
    }
    
    private generateStatModification(modData: {name: string, value: number}[]): HeroModification {
        const mod: HeroModification = {
            type: HeroModificationType.ADD_STAT,
            attributeName: 'stats',
            data: modData,
        }
        return mod;
    }
}

const nullQuestMajorReward: QuestMajorReward = {
    groupName: null,
    connection: null,
    office: null,
}
