import { Hero, HeroModificationType, AccoladeType, HeroModification, HeroEquipment, EquipmentType, EquipmentMaterial, HeroAccolade, HeroAffiliation, HeroConnection, HeroTitlePosition, HeroStat, TaskMode } from '../models/models';
import { randRange, randFromList, deepCopyObject, randFromListLow, randFromListHigh, generateRandomName, capitalizeInitial, getIterableEnumKeys } from './utils';
import { PROLOGUE_ADVENTURE_NAME } from './storyline-helpers';
import { IS_DEBUG, WEAPON_MATERIALS, SHEILD_MATERIALS, ARMOR_MATERIALS, EPITHET_DESCRIPTORS, EPITHET_BEING_ALL, TITLE_POSITIONS_ALL, SOBRIQUET_MODIFIERS, SOBRIQUET_NOUN_PORTION, HONORIFIC_TEMPLATES, OFFICE_POSITIONS_ALL, STANDARD_GROUPS_INDEFINITE } from '../global/config';
import { GameSettingsManager } from '../services/game-settings-manager';
import { HeroInitData, HeroAbilityType, HeroAbility } from '../models/hero-models';
import { GameSetting } from './game-setting';

export function createNewHero(heroling: HeroInitData, gameSetting: GameSetting): Hero {
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

export function applyHeroModifications(baseHero: Hero, heroMods: HeroModification[], resetModsList = true): Hero {
    let newHero: Hero = deepCopyObject(baseHero);         // need to deep clone rather than using Object.assign() or spread operator
    
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

export function updateHeroState(hero: Hero): Hero {
    let newHero = deepCopyObject(hero);          // need to deep clone rather than using Object.assign() or spread operator
    
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

export function getXpRequiredForNextLevel(curLevel: number): number {
    let xpRequired = 0;
    
    if (IS_DEBUG) {
        xpRequired = 30;
    } else {
        xpRequired = 20 * (curLevel + 1) * 60;
    }
    
    return xpRequired;
}

export function hasHeroReachedNextLevel(hero: Hero): boolean {
    if (hero.currentXp >= getXpRequiredForNextLevel(hero.level)) {
        return true;
    } else {
        return false;
    }
}

export function getLevelUpModifications(hero: Hero): HeroModification[] {
    const curGameSetting = GameSettingsManager.getInstance().getGameSettingById(hero.gameSettingId);

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
    const winStat1 = selectLevelBonusStatIndex(hero.stats);
    const winStat2 = selectLevelBonusStatIndex(hero.stats);
    const winStat1Name = GameSettingsManager.getInstance().getGameSettingById(hero.gameSettingId).statNames[winStat1];
    const winStat2Name = GameSettingsManager.getInstance().getGameSettingById(hero.gameSettingId).statNames[winStat2];
    if (winStat1 === winStat2) {
        levelMods.push(generateStatModification([{name: winStat1Name, value: 2}]));
    } else {
        levelMods.push(generateStatModification([{name: winStat1Name, value: 1}, {name: winStat2Name, value: 1}]));
    }
    levelMods.push(generateAbilityModification(hero));
    
    return levelMods;
}

function selectLevelBonusStatIndex(heroStats: HeroStat[]): number {
    let selectedStatIndex: number;
    selectedStatIndex = randRange(0,5);
    
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

function generateStatModification(modData: {name: string, value: number}[]): HeroModification {
    const mod: HeroModification = {
        type: HeroModificationType.ADD_STAT,
        attributeName: 'stats',
        data: modData,
    }
    return mod;
}

export function generateAbilityModification(hero: Hero, modValue: number = 1): HeroModification {
    const curGameSetting = GameSettingsManager.getInstance().getGameSettingById(hero.gameSettingId);
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

export function generateNewEquipmentModification(hero: Hero): HeroModification {
    const newEquipmentData = generateRandomEquipment(hero.level);
    
    const mod: HeroModification = {
        type: HeroModificationType.SET_EQUIPMENT,
        attributeName: 'equipment',
        data: [newEquipmentData],
    };

    return mod;
}

function generateRandomEquipment(targetLevel: number): HeroEquipment {
    //     randomly pick equipment type
    const newEquipmentType: EquipmentType = EquipmentType[randFromList(Object.keys(EquipmentType))];
    // 2. randomly pick 5 items of selected equipment type, & pick the one closest to hero level
    let targetList: EquipmentMaterial[];
    if (newEquipmentType == EquipmentType.Weapon) {
        targetList = WEAPON_MATERIALS;
    } else if (newEquipmentType == EquipmentType.Shield) {
        targetList = SHEILD_MATERIALS;
    } else {
        targetList = ARMOR_MATERIALS;
    }
    
    let material = randFromList(targetList);
    for (let i = 0; i <= 5; i++) {
        let compare = randFromList(targetList);
        if (Math.abs(targetLevel - material.baseLevel) > Math.abs(targetLevel - compare.baseLevel)) {
            material = compare;
        }
    }

    // 3. add up to 2 modifiers (no duplicates) to bring quality of selected item closer to hero level (don't allow it to go over)
    let qualityDifference = targetLevel - material.baseLevel;
    let newEquipmentDescription = material.description;
    for (let i = 0; i < 2 && qualityDifference != 0; i++) {
        const modifier = randFromList(material.modifierList.filter(i => qualityDifference > 0 ? i.levelModifier >= 0 : i.levelModifier < 0));
        if (newEquipmentDescription.includes(modifier.description)) {
            //no repeats
            break;
        }
        if (Math.abs(qualityDifference) < Math.abs(modifier.levelModifier)) {
            // too much
            break;
        }

        newEquipmentDescription = `${modifier.description} ${newEquipmentDescription}`;
        qualityDifference -= modifier.levelModifier;
    }
    
    // 4. add remainder of difference (between quality of item adjusted by mods and hero level) as numeric modifier.
    if (qualityDifference != 0) {
        newEquipmentDescription = `${qualityDifference > 0 ? '+' : ''}${qualityDifference} ${newEquipmentDescription}`;
    }

    const newEquipment = {
        type: newEquipmentType,
        description: newEquipmentDescription,
    };

    return newEquipment;
}

export function generateNewAccoladeModification(hero: Hero): HeroModification {
    const newAccoladeData = generateRandomAccolade(hero);
    
    const mod: HeroModification = {
        type: HeroModificationType.ADD_ACCOLADE,
        attributeName: 'accolades',
        data: [newAccoladeData],
    };

    return mod;
}

function generateRandomAccolade(hero: Hero): HeroAccolade {
    const newAccoladeType = AccoladeType[randFromList(getIterableEnumKeys(AccoladeType))];
    let newAccoladeDescription = '';
    let exclusions: string = '';
    switch(newAccoladeType) {
        case AccoladeType.Epithets:
            exclusions = hero.accolades.find(accolade => accolade.type == AccoladeType.Epithets).received.join(' ');
            newAccoladeDescription = generateRandomEpithetDescription(exclusions);
            break;
        case AccoladeType.Titles:
            exclusions = hero.accolades.find(accolade => accolade.type == AccoladeType.Titles).received.join(' ');
            newAccoladeDescription = generateRandomTitleDescription(exclusions);
            break;
            case AccoladeType.Sobriquets:
            exclusions = hero.accolades.find(accolade => accolade.type == AccoladeType.Sobriquets).received.join(' ');
            newAccoladeDescription = generateRandomSobriquetDescription(exclusions);
            break;
            case AccoladeType.Honorifics:
            exclusions = hero.accolades.find(accolade => accolade.type == AccoladeType.Honorifics).received.join(' ');
            newAccoladeDescription = generateRandomHonorificDescription(exclusions, hero.level, hero.name);
            break;
    }

    const newAccolade = {
        type: newAccoladeType,
        received: [newAccoladeDescription]
    }

    return newAccolade;
}

function generateRandomEpithetDescription(exclusions: string) {
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
function generateRandomTitleDescription(exclusions: string) {
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
function generateRandomSobriquetDescription(exclusions: string) {
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
function generateRandomHonorificDescription(exclusions: string, targetLevel: number, heroName: string) {
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

export function generateNewAffiliationModification(hero: Hero): HeroModification {
    const newAffiliationData = generateRandomAffiliation(hero);

    const mod = {
        type: HeroModificationType.ADD_AFFILIATION,
        attributeName: 'affiliations',
        data: [newAffiliationData],
    };

    return mod;
}

function generateRandomAffiliation(hero: Hero): HeroAffiliation {
    let newAffiliationData: HeroAffiliation;

    let newAffiliationFactories: ((existingAffiliations: HeroAffiliation[]) => HeroAffiliation)[] = [];
    if (hero.affiliations.length < STANDARD_GROUPS_INDEFINITE.length) {
        newAffiliationFactories.push(generateRandomDistinctConnection);
        newAffiliationFactories.push(generateRandomDistinctConnection); // double the odds
    }
    if (hero.affiliations.some(a => a.office == null)) {
        newAffiliationFactories.push(generateRandomDistinctMembership);
        newAffiliationFactories.push(generateRandomDistinctMembership); // double the odds
    }
    if (hero.affiliations.some(a => isNonNullNonHighestOffice(a.office))) {
        newAffiliationFactories.push(generateRandomDistinctHigherOffice);
    }

    
    let selectedFactory = randFromList(newAffiliationFactories);
    newAffiliationData = selectedFactory(hero.affiliations);

    return newAffiliationData;
}

const nullAffiliation: HeroAffiliation = {
    groupName: null,
    connection: null,
    office: null,
}

function generateRandomDistinctConnection(existingAffiliations: HeroAffiliation[]): HeroAffiliation {
    const availableDistinctGroups: string[] = STANDARD_GROUPS_INDEFINITE.filter((groupName: string) => {
        return !existingAffiliations.some(a => a.groupName == groupName);
    });

    if (availableDistinctGroups.length === 0) {
        return nullAffiliation;
    }
    
    const newConnectionName = generateRandomName();
    const newConnectionTitle = randFromList(OFFICE_POSITIONS_ALL.slice(1));
    const newGroupName = randFromList(availableDistinctGroups);
    const newConnection: HeroConnection = {
        personName: newConnectionName,
        personTitle: newConnectionTitle,
    }
    const returnData: HeroAffiliation = {
        groupName: newGroupName,
        connection: newConnection,
        office: null,
    }
    return returnData;
}

function generateRandomDistinctMembership(existingAffiliations: HeroAffiliation[]): HeroAffiliation {
    // list of all groups we have a connection with but don't currently have membership (ie, an office)
    const availableMembershipGroups: string[] = existingAffiliations.filter(a => a.office == null).map(a => a.groupName);

    if (availableMembershipGroups.length === 0) {
        return nullAffiliation;
    }

    const newMembershipGroupName = randFromList(availableMembershipGroups);
    const newOffice = OFFICE_POSITIONS_ALL[0];
    const returnData: HeroAffiliation = {
        groupName: newMembershipGroupName,
        office: newOffice,
        connection: null,
    }
    return returnData;
}

function generateRandomDistinctHigherOffice(existingAffiliations: HeroAffiliation[]): HeroAffiliation {
    // list of all groups with a non-null office that is also not the highest office
    const availableOfficeGroups: string[] = existingAffiliations.filter(a => isNonNullNonHighestOffice(a.office)).map(a => a.groupName);
    if (availableOfficeGroups.length === 0) {
        return nullAffiliation;
    }
    const group = randFromList(availableOfficeGroups);
    
    const existingAffiliation: HeroAffiliation = existingAffiliations.find(a => a.groupName == group);
    // list of all positions higher than currently "held" office, non-dup with the same group's Connection
    const availableOfficePositions: string[] = OFFICE_POSITIONS_ALL.slice(OFFICE_POSITIONS_ALL.indexOf(existingAffiliation.office) + 1).filter(o => {
            return o != existingAffiliation.connection.personTitle;
        });
    
    const newOffice = randFromListLow(availableOfficePositions, 3);
    const returnData: HeroAffiliation = {
        groupName: group,
        office: newOffice,
        connection: null,
    }
    return returnData;
}

function isNonNullNonHighestOffice(officeName: string) {
    return !!officeName && OFFICE_POSITIONS_ALL.indexOf(officeName) < (OFFICE_POSITIONS_ALL.length - 1)
}
