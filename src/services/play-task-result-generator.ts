import { GameSettingsManager } from "./game-settings-manager";
import { Adventure, HeroAbilityType, LootMajorReward } from "../models/hero-models";
import { IS_DEBUG } from "../global/config";
import { Hero, HeroModification, HeroModificationType, TrialMajorReward, TrialMajorRewardType, HeroTitlePosition, QuestMajorReward, HeroConnection, HeroStat, HeroOffice } from "../models/models";
import { randRange, randFromList, randFromListLow, capitalizeInitial, randFromListHigh, generateRandomName } from "../global/utils";
import { GameSetting } from "../global/game-setting";

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
            results.push(randRange(0, 1)
                ? this.generateNewLootMajorRewardModification(
                        currentHero.level,
                        currentHero.lootMajorRewards,
                        this.gameSettingsMgr.getGameSettingById(currentHero.gameSettingId)
                    )
                : this.generateAbilityModification(currentHero));
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
    
    public generateNewLootMajorRewardModification(requestedLevel: number, existingRewards: LootMajorReward[], gameSetting: GameSetting): HeroModification {
        const newLootMajorRewardData = this.generateRandomLootMajorReward(requestedLevel, existingRewards, gameSetting);
        
        const mod: HeroModification = {
            type: HeroModificationType.SET_LOOT_MAJOR_REWARD,
            attributeName: 'lootMajorRewards',
            data: [newLootMajorRewardData],
        };
    
        return mod;
    }
    
    private generateRandomLootMajorReward(requestedLevel: number, existingRewards: LootMajorReward[], gameSetting: GameSetting): LootMajorReward {
        //     pick LootMajorReward type, favoring types with lower "effective levels"
        const sortedExistingRewards = [...existingRewards].sort((a, b) => a.effectiveLevel || 0 - b.effectiveLevel || 0);
        const newLootMajorRewardTypeName: string = randFromListLow(sortedExistingRewards.map(r => r.type));
        const newLootMajorRewardType = gameSetting.lootMajorRewardTypes.find(t => t.name == newLootMajorRewardTypeName);
        // 2. randomly pick 5 items of selected LootMajorReward type, & pick the one closest to hero level
        const targetList = gameSetting.lootMajorRewardMaterialTypes.find(emt => emt.name == newLootMajorRewardType.materialType).options;
        
        let material = randFromList(targetList);
        for (let i = 0; i <= 5; i++) {
            let compare = randFromList(targetList);
            if (Math.abs(requestedLevel - material.baseLevel) > Math.abs(requestedLevel - compare.baseLevel)) {
                material = compare;
            }
        }
    
        // 3. add up to 2 modifiers (no duplicates) to bring quality of selected item closer to hero level (don't allow it to go over)
        let qualityDifference = requestedLevel - material.baseLevel;
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
            effectiveLevel: requestedLevel,
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
        const gameSetting = this.gameSettingsMgr.getGameSettingById(hero.gameSettingId);
        const newTrialMajorRewardTypeIndex = randRange(0, gameSetting.trialMajorRewardTypes.length-1);
        let newTrialMajorRewardDescription = '';
        let exclusions: string = '';
        switch(newTrialMajorRewardTypeIndex) {
            case TrialMajorRewardType.Epithets:
                exclusions = hero.trialMajorRewards[TrialMajorRewardType.Epithets].received.join(' ');
                newTrialMajorRewardDescription = this.generateRandomEpithetDescription(exclusions, gameSetting);
                break;
            case TrialMajorRewardType.Titles:
                exclusions = hero.trialMajorRewards[TrialMajorRewardType.Titles].received.join(' ');
                newTrialMajorRewardDescription = this.generateRandomTitleDescription(exclusions, gameSetting);
                break;
            case TrialMajorRewardType.Sobriquets:
                exclusions = hero.trialMajorRewards[TrialMajorRewardType.Sobriquets].received.join(' ');
                newTrialMajorRewardDescription = this.generateRandomSobriquetDescription(exclusions, gameSetting);
                break;
            case TrialMajorRewardType.Honorifics:
                exclusions = hero.trialMajorRewards[TrialMajorRewardType.Honorifics].received.join(' ');
                newTrialMajorRewardDescription = this.generateRandomHonorificDescription(exclusions, hero.level, hero.name, gameSetting);
                break;
        }
    
        const newTrialMajorReward: TrialMajorReward = {
            type: gameSetting.trialMajorRewardTypes[newTrialMajorRewardTypeIndex],
            received: [newTrialMajorRewardDescription]
        }
    
        return newTrialMajorReward;
    }
    
    private generateRandomEpithetDescription(exclusions: string, gameSetting: GameSetting) {
        let epithetDescriptor: string;
        let epithetBeing: string;
    
        do {
            epithetDescriptor = randFromList(gameSetting.epithetDescriptors);
        } while (exclusions.toLocaleLowerCase().includes(epithetDescriptor.toLocaleLowerCase()));
        do {
            epithetBeing = randFromList(gameSetting.epithetBeingAll);
        } while (exclusions.toLocaleLowerCase().includes(epithetBeing.toLocaleLowerCase()));
    
        let epithetDescription = `${epithetDescriptor} ${epithetBeing}`;
        return epithetDescription;
    };
    private generateRandomTitleDescription(exclusions: string, gameSetting: GameSetting) {
        let titlePosition: HeroTitlePosition;
        let titleObject: string;
        do {
            titlePosition = randFromList(gameSetting.titlePositionsAll);
        } while (exclusions.toLocaleLowerCase().includes(titlePosition.description.toLocaleLowerCase()));
        do {
            titleObject = gameSetting.hydrateFromNameSources(randFromList(titlePosition.titleObjectList));
        } while (exclusions.toLocaleLowerCase().includes(titleObject.toLocaleLowerCase()));
    
        const titleDescription = `${titlePosition.description} of ${titleObject}`;
    
        return titleDescription;
    }
    private generateRandomSobriquetDescription(exclusions: string, gameSetting: GameSetting) {
        let modifier = ''
        do {
            modifier = randFromList(gameSetting.sobriquetModifiers);
        } while (exclusions.toLocaleLowerCase().includes(modifier.toLocaleLowerCase()));
    
        // one or two (twice as likely) SOBRIQUET_NOUN_PORTIONs
        let noun = '';
        for (let i = 0; i < (randRange(0, 2) || 2); i++) {
            let nounPortion = '';
            do {
                nounPortion = randFromList(gameSetting.sobriquetNounPortions);
            } while (exclusions.toLocaleLowerCase().includes(nounPortion.toLocaleLowerCase()) || noun.toLocaleLowerCase().includes(nounPortion.toLocaleLowerCase()));
            noun += nounPortion;
        }
    
        const sobriquetDescription = `${modifier} ${capitalizeInitial(noun)}`;
        return sobriquetDescription;
    }
    private generateRandomHonorificDescription(exclusions: string, targetLevel: number, heroName: string, gameSetting: GameSetting) {
        let honorificTemplate: string;
        let honorificDescription: string;
        
        const deviation = 4;
        const minIndex = Math.min(targetLevel - deviation, gameSetting.honorificTemplates.length - deviation);
        const maxIndex = Math.max(targetLevel + deviation, deviation);
        do {
            honorificTemplate = randFromListHigh(gameSetting.honorificTemplates, 1, minIndex, maxIndex);
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
        const gameSetting = this.gameSettingsMgr.getGameSettingById(hero.gameSettingId);
        let newRewardData: QuestMajorReward;
    
        let newRewardFactories: ((hero: Hero) => QuestMajorReward)[] = [];
        if (hero.questMajorRewards.length < gameSetting.questMajorRewardGroups.length) {
            newRewardFactories.push(this.generateRandomDistinctConnection);
        }
        if (hero.questMajorRewards.some(r => r.office == null)) {
            newRewardFactories.push(this.generateRandomDistinctMembership);
        }
        if (hero.questMajorRewards.some(r => r.office != null)) {
            // want advancement to occur more frequently than new connections/memberships
            newRewardFactories.push(this.generateRandomDistinctHigherOffice);
            newRewardFactories.push(this.generateRandomDistinctHigherOffice);
        }
    
        
        let selectedFactory = randFromList(newRewardFactories);
        newRewardData = selectedFactory.bind(this)(hero);
    
        return newRewardData;
    }
    
    
    private generateRandomDistinctConnection(hero: Hero): QuestMajorReward {
        const gameSetting = this.gameSettingsMgr.getGameSettingById(hero.gameSettingId);
        const availableDistinctGroups: string[] = gameSetting.questMajorRewardGroups.map(g => g.groupName).filter((groupName: string) => {
            return !hero.questMajorRewards.some(a => a.groupName == groupName);
        });
    
        if (availableDistinctGroups.length === 0) {
            return nullQuestMajorReward;
        }
        
        const newConnectionName = generateRandomName(this.gameSettingsMgr.getGameSettingById(hero.gameSettingId));
        const newConnectionTitle = randFromList(gameSetting.officePositionsAll.slice(1));
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
        const gameSetting = this.gameSettingsMgr.getGameSettingById(hero.gameSettingId);
        // list of all groups we have a connection with but don't currently have membership (ie, an office)
        const availableMembershipGroups: string[] = hero.questMajorRewards.filter(a => a.office == null).map(a => a.groupName);
    
        if (availableMembershipGroups.length === 0) {
            return nullQuestMajorReward;
        }
    
        const newMembershipGroupName = randFromList(availableMembershipGroups);
        const newOffice: HeroOffice = {
            officeName: gameSetting.officePositionsAll[0],
            officeRank: 1,
            officeIterationCount: 1,
        };
        const returnData: QuestMajorReward = {
            groupName: newMembershipGroupName,
            office: newOffice,
            connection: null,
        }
        return returnData;
    }
    
    private generateRandomDistinctHigherOffice(hero: Hero): QuestMajorReward {
        const gameSetting = this.gameSettingsMgr.getGameSettingById(hero.gameSettingId);

        // list of all groups with a non-null office
        const availableOfficeGroups: QuestMajorReward[] = hero.questMajorRewards.filter(r => r.office != null);
        if (availableOfficeGroups.length === 0) {
            return nullQuestMajorReward;
        }
        const rewardToUpgrade = Object.assign({}, randFromList(availableOfficeGroups));
        const rewardToUpgradeGroup = gameSetting.questMajorRewardGroups.find(g => g.groupName === rewardToUpgrade.groupName);
        
        // Just add office iteration
        if (rewardToUpgrade.office.officeName === rewardToUpgradeGroup.topOfficeName || !!randRange(0, 2)) {
            rewardToUpgrade.office.officeIterationCount += 1;
        } else {
            // increase office rank
            const nextHigherOfficeName = this.getNextHigherOfficeName(rewardToUpgrade.office, rewardToUpgradeGroup.topOfficeName, gameSetting);

            // swap with connection person if they have the next higher office
            if (rewardToUpgrade.connection.personTitle == nextHigherOfficeName) {
                rewardToUpgrade.connection.personTitle = rewardToUpgrade.office.officeName;
            }
            
            const nextHigherOfficeRank = nextHigherOfficeName === rewardToUpgradeGroup.topOfficeName ? gameSetting.officePositionsAll.length : gameSetting.officePositionsAll.indexOf(nextHigherOfficeName);
            rewardToUpgrade.office = {
                officeName: nextHigherOfficeName,
                officeRank: nextHigherOfficeRank,
                officeIterationCount: 1,
            }
        }
        
        return rewardToUpgrade;
    }

    private getNextHigherOfficeName(office: HeroOffice, groupTopOfficeName: string, gameSetting: GameSetting): string {
        let officeIndex = gameSetting.officePositionsAll.indexOf(office.officeName);
        if (officeIndex === -1) {
            officeIndex = office.officeRank;
        }
        if (officeIndex + 1 >= gameSetting.officePositionsAll.length) {
            return groupTopOfficeName;
        }
        return gameSetting.officePositionsAll[officeIndex+1];
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
