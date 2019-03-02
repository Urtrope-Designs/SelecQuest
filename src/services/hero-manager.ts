import { Hero, HeroModificationType, TrialMajorRewardType, HeroModification, TrialMajorReward, QuestMajorReward } from '../models/models';
import { randRange, deepCopyObject, getIterableEnumKeys } from '../global/utils';
import { IS_DEBUG } from '../global/config';
import { GameSettingsManager } from './game-settings-manager';
import { HeroInitData, HeroAbilityType, LootMajorReward, HeroAbility } from '../models/hero-models';
import { GameSetting } from '../global/game-setting';
import { TaskMode } from '../models/task-models';

export class HeroManager {

    constructor(private gameSettingsMgr: GameSettingsManager) {
    }

    public createNewHero(heroling: HeroInitData): Hero {
        const gameSetting: GameSetting = this.gameSettingsMgr.getGameSettingById(heroling.gameSettingId);
        const LONG_TERM_LIMIT_FACTOR = 25;
        const newHero: Hero = {
            name: heroling.name,
            raceName: heroling.raceName,
            class: heroling.className,
            level: 1,
            stats: heroling.stats,
            /* can't use spread operator for these, TS compilation of that happens to break getters below... */
            // str: stats.str,
            // dex: stats.dex,
            // con: stats.con,
            // int: stats.int,
            // wis: stats.wis,
            // cha: stats.cha,
            maxHealthStat: {name: gameSetting.healthStatName, value: randRange(0, 7) + Math.floor(heroling.stats[gameSetting.healthBaseStatIndex].value / 6)},
            maxMagicStat: {name: gameSetting.magicStatName, value: randRange(0, 7) + Math.floor(heroling.stats[gameSetting.magicBaseStatIndex].value / 6)},
            currentXp: 0,
            abilities: gameSetting.abilityTypes.map(aT => {return {name: aT.displayName, received: []}}),
            lootMajorRewards: gameSetting.lootMajorRewardTypes.map(et => ({type: et.name, description: ''})),
            trialMajorRewards: getIterableEnumKeys(TrialMajorRewardType).map(typeKey => ({type: TrialMajorRewardType[typeKey], received: []})),
            questMajorRewards: [],
            get maxLootBuildUp() {return this.stats[gameSetting.taskModeData[TaskMode.LOOT_MODE].buildUpLimitBaseStatIndex].value + 10},
            get maxTrialBuildUp() {return this.stats[gameSetting.taskModeData[TaskMode.TRIAL_MODE].buildUpLimitBaseStatIndex].value + 10},
            get maxQuestBuildUp() {return this.stats[gameSetting.taskModeData[TaskMode.QUEST_MODE].buildUpLimitBaseStatIndex].value + 10},
            currency: [0, 0, 0],
            spentCurrency: [0, 0, 0],
            lootBuildUpRewards: [],
            trialBuildUpRewards: [],
            questBuildUpRewards: [],
            isInTeardownMode: [true, true, true],
            lootEnvironmentalLimit: 0,
            get maxLootEnvironmentalLimit() {
                if (IS_DEBUG) {
                    return 35;
                } else {
                    return LONG_TERM_LIMIT_FACTOR * (this.level + this.stats[gameSetting.taskModeData[TaskMode.LOOT_MODE].environmentalLimitBaseStatIndex].value);
                }
            },
            trialEnvironmentalLimit: 0,
            get maxTrialEnvironmentalLimit() {
                if (IS_DEBUG) {
                    return 35;
                } else {
                    return LONG_TERM_LIMIT_FACTOR * (this.level + this.stats[gameSetting.taskModeData[TaskMode.TRIAL_MODE].environmentalLimitBaseStatIndex].value);
                }
            },
            questEnvironmentalLimit: 0,
            get maxQuestEnvironmentalLimit() {
                if (IS_DEBUG) {
                    return 35;
                } else {
                    return LONG_TERM_LIMIT_FACTOR * (this.level + this.stats[gameSetting.taskModeData[TaskMode.QUEST_MODE].environmentalLimitBaseStatIndex].value);
                }
            },
            currentAdventure: IS_DEBUG 
                ? {name: 'Chapter 1', progressRequired: 60} 
                : {
                    name: gameSetting.prologueAdventureName,
                    progressRequired: gameSetting.prologueTasks.reduce((total: number, curTask) => total + curTask.durationSeconds, 0),
                },
            completedAdventures: [],
            adventureProgress: 0,
            latestModifications: [],
            gameSettingId: heroling.gameSettingId,
        }
        
        return newHero;
    }

    public applyHeroTaskUpdates(baseHero: Hero, heroMods: HeroModification[]): Hero {
        let newHero: Hero = deepCopyObject(baseHero);         // need to deep clone rather than using Object.assign() or spread operator
        newHero = this.applyHeroModifications(newHero, heroMods);
        newHero = this.enforceHeroLimitBounds(newHero);
        return newHero;
    }

    public applyHeroModifications(newHero: Hero, heroMods: HeroModification[], resetModsList = true): Hero {
        if (resetModsList) {
            newHero.latestModifications = [];
        }
    
        const applyNameValue = (valueAttributeName: string) => {
            return (heroToMod: Hero, mod: HeroModification) => {
                for (let item of mod.data) {
                    let existingItem: any;
                    if (Array.isArray(heroToMod[mod.attributeName])) {
                        existingItem = heroToMod[mod.attributeName].find((i) => {
                            return item.name == i.name;
                        });
                    } else {
                        existingItem = heroToMod[mod.attributeName];
                    }
                    if (!!existingItem) {
                        existingItem[valueAttributeName] += item[valueAttributeName];
                        if (existingItem[valueAttributeName] < 1) {
                            const existingItemIndex = heroToMod[mod.attributeName].indexOf(existingItem)
                            heroToMod[mod.attributeName].splice(existingItemIndex, 1);
                        }
                    } else {
                        heroToMod[mod.attributeName].push(item);
                    }
                    heroToMod.latestModifications.push({attributeName: mod.attributeName, data: item.name})
                }
            
            }
        }
        
        for (let result of heroMods) {
            switch(result.type) {
                case HeroModificationType.INCREASE:
                    /* level, currentXp, lootEnvironmentalLimit, trialEnvironmentalLimit, questEnvironmentalLimit, adventureProgress */
                    newHero.latestModifications.push({attributeName: result.attributeName, data: null});
                    // fallthrough
                case HeroModificationType.DECREASE:
                    /* lootEnvironmentalLimit, trialEnvironmentalLimit, questEnvironmentalLimit */
                    newHero[result.attributeName] += result.data;
                    break;
                case HeroModificationType.SET:
                    /* currentXp, isInLootSelloffMode, isInTrophyBoastingMode, isInLeadFollowingMode, currentAdventure, adventureProgress */
                    newHero[result.attributeName] = result.data;
                    newHero.latestModifications.push({attributeName: result.attributeName, data: null});
                    break;
                case HeroModificationType.SET_LOOT_MAJOR_REWARD:
                    /* lootMajorRewards */
                    result.data.map((reward: LootMajorReward) => {
                        const existingReward = newHero[result.attributeName].find(r => {
                            return r.type == reward.type;
                        })
                        existingReward.description = reward.description;
                        newHero.latestModifications.push({attributeName: result.attributeName, data: reward.type});
                    })
                    break;
                case HeroModificationType.ADD_STAT:
                    /* stats, maxHealthStat, maxMagicStat */
                    applyNameValue('value')(newHero, result);
                    break;
                case HeroModificationType.ADD_RANK:
                    /* abilities */
                    const existingAbilityType: HeroAbilityType = newHero.abilities.find(a => a.name == result.data.name);
                    result.data.received.forEach((ability: HeroAbility) => {
                        const existingItem = existingAbilityType.received.find((eA: HeroAbility) => eA.name == ability.name);
                        if (!existingItem) {
                            existingAbilityType.received.push(ability);
                        } else {
                            existingItem.rank += ability.rank;
                        }
                    });
                    newHero.latestModifications.push(result);
                    break;
                case HeroModificationType.ADD_QUANTITY:
                    /* lootBuildUpRewards, trialBuildUpRewards */
                    applyNameValue('quantity')(newHero, result);
                    break;
                case HeroModificationType.REMOVE_QUANTITY:
                case HeroModificationType.REMOVE:
                    /* lootBuildUpRewards, trialBuildUpRewards, questBuildUpRewards */
                    for (let item of result.data) {
                        let existingItemIndex = newHero[result.attributeName].findIndex((i) => {
                            return item.name == i.name;
                        });
                        if (existingItemIndex != -1) {
                            newHero[result.attributeName].splice(existingItemIndex, 1);
                        }
                    }
                    break;
                case HeroModificationType.ADD:
                    /* questBuildUpRewards, completedAdventures */
                    newHero[result.attributeName] = newHero[result.attributeName].concat(result.data);
                    newHero.latestModifications.push({attributeName: result.attributeName, data: null});
                    break;
                case HeroModificationType.ADD_TRIAL_MAJOR_REWARD:
                    /* trialMajorRewards */
                    result.data.map((newTrialMajorReward: TrialMajorReward) => {
                        const existingTrialMajorReward: TrialMajorReward = newHero[result.attributeName].find(r => {
                            return r.type == newTrialMajorReward.type;
                        })
                        existingTrialMajorReward.received = existingTrialMajorReward.received.concat(newTrialMajorReward.received);
                        if (existingTrialMajorReward.received.length > 3) {
                            existingTrialMajorReward.received.splice(0, existingTrialMajorReward.received.length - 3);
                        }
                        newHero.latestModifications.push({attributeName: result.attributeName, data: newTrialMajorReward.type});
                    })
                    break;
                case HeroModificationType.ADD_QUEST_MAJOR_REWARD:
                    /* questMajorRewards */
                    result.data.map((newQuestMajorReward: QuestMajorReward) => {
                        if (newQuestMajorReward.connection != null) {
                            newHero.questMajorRewards.push(newQuestMajorReward);
                        }
                        if (newQuestMajorReward.office != null) {
                            const existingQuestMajorReward: QuestMajorReward = newHero.questMajorRewards.find(a => {
                                return a.groupName == newQuestMajorReward.groupName;
                            });
                            existingQuestMajorReward.office = newQuestMajorReward.office;
                        }
                        
                        newHero.latestModifications.push({attributeName: result.attributeName, data: newQuestMajorReward});
                    })
                    break;
                case HeroModificationType.SET_TEARDOWN_MODE:
                    /* teardown modes */
                    result.data.forEach((teardownUpdate: {index: TaskMode, value: boolean}) => {
                        newHero.isInTeardownMode[teardownUpdate.index] = teardownUpdate.value;
                    });
                    break;
                case HeroModificationType.ADD_CURRENCY:
                    /* currency, spent currency */
                    result.data.forEach((currencyUpdate: {index: TaskMode, value: number}) => {
                        newHero[result.attributeName][currencyUpdate.index] += currencyUpdate.value;
                    });
                    newHero.latestModifications.push({attributeName: result.attributeName, data: result.data.map(u => u.index)});
                    break;
            }
        }
        
        return newHero;
    }

    private enforceHeroLimitBounds(newHero: Hero): Hero {
        newHero.lootEnvironmentalLimit = Math.min(newHero.lootEnvironmentalLimit, newHero.maxLootEnvironmentalLimit);
        newHero.lootEnvironmentalLimit = Math.max(newHero.lootEnvironmentalLimit, 0);
        newHero.trialEnvironmentalLimit = Math.min(newHero.trialEnvironmentalLimit, newHero.maxTrialEnvironmentalLimit);
        newHero.trialEnvironmentalLimit = Math.max(newHero.trialEnvironmentalLimit, 0);
        newHero.questEnvironmentalLimit = Math.min(newHero.questEnvironmentalLimit, newHero.maxQuestEnvironmentalLimit);
        newHero.questEnvironmentalLimit = Math.max(newHero.questEnvironmentalLimit, 0);
        newHero.adventureProgress = Math.min(newHero.adventureProgress, newHero.currentAdventure.progressRequired);
        newHero.adventureProgress = Math.max(newHero.adventureProgress, 0);
        
        return newHero;
    }
    
    static getXpRequiredForNextLevel(curLevel: number): number {
        let xpRequired = 0;
        
        if (IS_DEBUG) {
            xpRequired = 30;
        } else {
            xpRequired = 20 * (curLevel + 1) * 60;
        }
        
        return xpRequired;
    }
    
    static hasHeroReachedNextLevel(hero: Hero): boolean {
        if (hero.currentXp >= HeroManager.getXpRequiredForNextLevel(hero.level)) {
            return true;
        } else {
            return false;
        }
    }
}
