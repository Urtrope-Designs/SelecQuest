import { Hero, HeroModificationType, AccoladeType, HeroModification, HeroEquipment, EquipmentType, HeroAccolade, HeroAffiliation, HeroStat, TaskMode } from '../models/models';
import { randRange, deepCopyObject, getIterableEnumKeys } from '../global/utils';
import { PROLOGUE_ADVENTURE_NAME } from '../global/storyline-helpers';
import { IS_DEBUG } from '../global/config';
import { GameSettingsManager } from './game-settings-manager';
import { HeroInitData, HeroAbilityType, HeroAbility } from '../models/hero-models';
import { GameSetting } from '../global/game-setting';
import { PlayTaskResultGenerator } from './play-task-result-generator';

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
            equipment: getIterableEnumKeys(EquipmentType).map(typeKey => ({type: EquipmentType[typeKey], description: ''})),
            accolades: getIterableEnumKeys(AccoladeType).map(typeKey => ({type: AccoladeType[typeKey], received: []})),
            affiliations: [],
            get maxEncumbrance() {return this.stats[0].value + 10},
            get maxEquipmentWear() {return this.stats[1].value + 10},
            get maxQuestLogSize() {return this.stats[3].value + 10},
            gold: 0,
            renown: 0,
            spentRenown: 0,
            reputation: 0,
            spentReputation: 0,
            loot: [],
            trophies: [],
            leads: [],
            isInTeardownMode: [true, true, true],
            marketSaturation: 0,
            get maxMarketSaturation() {
                if (IS_DEBUG) {
                    return 35;
                } else {
                    return LONG_TERM_LIMIT_FACTOR * (this.level + this.stats[3].value);
                }
            },
            fatigue: 0,
            get maxFatigue() {
                if (IS_DEBUG) {
                    return 35;
                } else {
                    return LONG_TERM_LIMIT_FACTOR * (this.level + this.stats[2].value);
                }
            },
            socialExposure: 0,
            get maxSocialCapital() {
                if (IS_DEBUG) {
                    return 35;
                } else {
                    return LONG_TERM_LIMIT_FACTOR * (this.level + this.stats[4].value);
                }
            },
            currentAdventure: IS_DEBUG ? {name: 'Chapter 1', progressRequired: 60} : {name: PROLOGUE_ADVENTURE_NAME, progressRequired: 28},
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
        newHero = this.updateHeroState(newHero);
        if (HeroManager.hasHeroReachedNextLevel(newHero)) {
            const levelUpMods = this.generateLevelUpModifications(newHero)
            newHero = this.applyHeroModifications(newHero, levelUpMods, false);
        }
        return newHero;
    }

    private applyHeroModifications(newHero: Hero, heroMods: HeroModification[], resetModsList = true): Hero {
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
                    /* level, currentXp, gold, renown, spentRenown, reputation, spentReputation,
                    marketSaturation, fatigue, socialExposure, adventureProgress */
                    newHero.latestModifications.push({attributeName: result.attributeName, data: null});
                    // fallthrough
                case HeroModificationType.DECREASE:
                    /* gold, marketSaturation, fatigue, socialExposure */
                    newHero[result.attributeName] += result.data;
                    break;
                case HeroModificationType.SET:
                    /* currentXp, isInLootSelloffMode, isInTrophyBoastingMode, isInLeadFollowingMode, currentAdventure, adventureProgress */
                    newHero[result.attributeName] = result.data;
                    newHero.latestModifications.push({attributeName: result.attributeName, data: null});
                    break;
                case HeroModificationType.SET_EQUIPMENT:
                    /* equipment */
                    result.data.map((equip: HeroEquipment) => {
                        const existingEquipment = newHero[result.attributeName].find(e => {
                            return e.type == equip.type;
                        })
                        existingEquipment.description = equip.description;
                        newHero.latestModifications.push({attributeName: result.attributeName, data: equip.type});
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
                    /* loot, trophies */
                    applyNameValue('quantity')(newHero, result);
                    break;
                case HeroModificationType.REMOVE_QUANTITY:
                case HeroModificationType.REMOVE:
                    /* loot, trophies, leads */
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
                    /* leads, completedAdventures */
                    newHero[result.attributeName] = newHero[result.attributeName].concat(result.data);
                    newHero.latestModifications.push({attributeName: result.attributeName, data: null});
                    break;
                case HeroModificationType.ADD_ACCOLADE:
                    /* accolades */
                    result.data.map((newAccolade: HeroAccolade) => {
                        const existingAccolade: HeroAccolade = newHero[result.attributeName].find(a => {
                            return a.type == newAccolade.type;
                        })
                        existingAccolade.received = existingAccolade.received.concat(newAccolade.received);
                        if (existingAccolade.received.length > 3) {
                            existingAccolade.received.splice(0, existingAccolade.received.length - 3);
                        }
                        newHero.latestModifications.push({attributeName: result.attributeName, data: newAccolade.type});
                    })
                    break;
                case HeroModificationType.ADD_AFFILIATION:
                    /* affiliations */
                    result.data.map((newAffiliation: HeroAffiliation) => {
                        if (newAffiliation.connection != null) {
                            newHero.affiliations.push(newAffiliation);
                        }
                        if (newAffiliation.office != null) {
                            const existingAffiliation: HeroAffiliation = newHero.affiliations.find(a => {
                                return a.groupName == newAffiliation.groupName;
                            });
                            existingAffiliation.office = newAffiliation.office;
                        }
                        
                        newHero.latestModifications.push({attributeName: result.attributeName, data: newAffiliation});
                    })
                    break;
                case HeroModificationType.SET_TEARDOWN_MODE:
                    /* teardown modes */
                    result.data.forEach((teardownUpdate: {index: TaskMode, value: boolean}) => {
                        newHero.isInTeardownMode[teardownUpdate.index] = teardownUpdate.value;
                    })
                    break;
            }
        }
        
        return newHero;
    }

    private updateHeroState(newHero: Hero): Hero {
        newHero.marketSaturation = Math.min(newHero.marketSaturation, newHero.maxMarketSaturation);
        newHero.marketSaturation = Math.max(newHero.marketSaturation, 0);
        newHero.fatigue = Math.min(newHero.fatigue, newHero.maxFatigue);
        newHero.fatigue = Math.max(newHero.fatigue, 0);
        newHero.socialExposure = Math.min(newHero.socialExposure, newHero.maxSocialCapital);
        newHero.socialExposure = Math.max(newHero.socialExposure, 0);
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
    
    private generateLevelUpModifications(hero: Hero): HeroModification[] {
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
        levelMods.push(PlayTaskResultGenerator.generateAbilityModification(hero, curGameSetting));
        
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
