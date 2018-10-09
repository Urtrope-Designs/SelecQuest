import { Hero, HeroModificationType, AccoladeType, AffiliationType, HeroModification, getHeroStatList, HeroStats, CharEquipment, EquipmentType, EquipmentMaterial, CharAccolade, CharAffiliations, CharConnection, CharMembership, CharOffice, CharTitlePosition } from './models';
import { randRange, randFromList, deepCopyObject, randFromListLow, randFromListHigh, generateRandomName, capitalizeInitial, getIterableEnumKeys } from './utils';
import { PROLOGUE_ADVENTURE_NAME } from './storyline-helpers';
import { SPELLS, ABILITIES, IS_DEBUG, WEAPON_MATERIALS, SHEILD_MATERIALS, ARMOR_MATERIALS, EPITHET_DESCRIPTORS, EPITHET_BEING_ALL, TITLE_POSITIONS_ALL, SOBRIQUET_MODIFIERS, SOBRIQUET_NOUN_PORTION, HONORIFIC_TEMPLATES, OFFICE_POSITIONS_ALL, STANDARD_GROUPS_INDEFINITE } from '../global/config';

export function createNewHero(name: string, raceName: string, className: string, stats: HeroStats): Hero {
    const LONG_TERM_LIMIT_FACTOR = 25;
    const newHero: Hero = {
        name: name,
        raceName: raceName,
        class: className,
        level: 1,
        /* can't use spread operator for these, TS compilation of that happens to break getters below... */
        str: stats.str,
        dex: stats.dex,
        con: stats.con,
        int: stats.int,
        wis: stats.wis,
        cha: stats.cha,
        maxHp: randRange(0, 7) + Math.floor(stats.con / 6),
        maxMp: randRange(0, 7) + Math.floor(stats.int / 6),
        currentXp: 0,
        spells: [],
        abilities: [],
        equipment: getIterableEnumKeys(EquipmentType).map(typeKey => ({type: EquipmentType[typeKey], description: ''})),
        accolades: getIterableEnumKeys(AccoladeType).map(typeKey => ({type: AccoladeType[typeKey], received: []})),
        affiliations: {
            [AffiliationType.CONNECTIONS]: [],
            [AffiliationType.MEMBERSHIPS]: [],
            [AffiliationType.OFFICES]: [],
        },
        get maxEncumbrance() {return this.str + 10},
        get maxEquipmentWear() {return this.dex + 10},
        get maxQuestLogSize() {return this.int + 10},
        gold: 0,
        renown: 0,
        spentRenown: 0,
        reputation: 0,
        spentReputation: 0,
        loot: [],
        trophies: [],
        leads: [],
        isInLootSelloffMode: true,
        isInTrophyBoastingMode: true,
        isInLeadFollowingMode: true,
        marketSaturation: 0,
        get maxMarketSaturation() {
            if (IS_DEBUG) {
                return 35;
            } else {
                return LONG_TERM_LIMIT_FACTOR * (this.level + this.int);
            }
        },
        fatigue: 0,
        get maxFatigue() {
            if (IS_DEBUG) {
                return 35;
            } else {
                return LONG_TERM_LIMIT_FACTOR * (this.level + this.con);
            }
        },
        socialExposure: 0,
        get maxSocialCapital() {
            if (IS_DEBUG) {
                return 35;
            } else {
                return LONG_TERM_LIMIT_FACTOR * (this.level + this.wis);
            }
        },
        currentAdventure: IS_DEBUG ? {name: 'Chapter 1', progressRequired: 60} : {name: PROLOGUE_ADVENTURE_NAME, progressRequired: 28},
        completedAdventures: [],
        adventureProgress: 0,
        latestModifications: [],
    }

    return newHero;
}
    
export function applyHeroModifications(baseChar: Hero, heroMods: HeroModification[], resetModsList = true): Hero {
    let newChar: Hero = deepCopyObject(baseChar);         // need to deep clone rather than using Object.assign() or spread operator

    if (resetModsList) {
        newChar.latestModifications = [];
    }

    for (let result of heroMods) {
        switch(result.type) {
            case HeroModificationType.INCREASE:
                /* level, stats, maxHp, maxMp, currentXp, gold, renown, spentRenown, reputation, spentReputation,
                    marketSaturation, fatigue, socialExposure, adventureProgress */
                newChar.latestModifications.push({attributeName: result.attributeName, data: null});
                // fallthrough
            case HeroModificationType.DECREASE:
                /* gold, marketSaturation, fatigue, socialExposure */
                newChar[result.attributeName] += result.data;
                break;
            case HeroModificationType.SET:
                /* currentXp, isInLootSelloffMode, isInTrophyBoastingMode, isInLeadFollowingMode, currentAdventure, adventureProgress */
                newChar[result.attributeName] = result.data;
                newChar.latestModifications.push({attributeName: result.attributeName, data: null});
                break;
            case HeroModificationType.SET_EQUIPMENT:
                /* equipment */
                result.data.map((equip: CharEquipment) => {
                    const existingEquipment = newChar[result.attributeName].find(e => {
                        return e.type == equip.type;
                    })
                    existingEquipment.description = equip.description;
                    newChar.latestModifications.push({attributeName: result.attributeName, data: equip.type});
                })
                break;
            case HeroModificationType.ADD_RANK:
                /* spells, abilities */
                for (let item of result.data) {
                    let existingItem = newChar[result.attributeName].find((i) => {
                        return item.name == i.name;
                    });
                    if (!!existingItem) {
                        existingItem.rank += item.rank;
                    } else {
                        newChar[result.attributeName].push(item);
                    }
                    newChar.latestModifications.push({attributeName: result.attributeName, data: item.name})
                }
                break;
            case HeroModificationType.ADD_QUANTITY:
                /* loot, trophies */
                for (let item of result.data) {
                    let existingItem = newChar[result.attributeName].find((i) => {
                        return item.name == i.name;
                    });
                    if (!!existingItem) {
                        existingItem.quantity += item.quantity;
                        if (existingItem.quantity < 1) {
                            const existingItemIndex = newChar[result.attributeName].indexOf(existingItem)
                            newChar[result.attributeName].splice(existingItemIndex, 1);
                        }
                    } else {
                        newChar[result.attributeName].push(item);
                    }
                    newChar.latestModifications.push({attributeName: result.attributeName, data: item.name})
                }
                break;
            case HeroModificationType.REMOVE_QUANTITY:
            case HeroModificationType.REMOVE:
                /* loot, trophies, leads */
                for (let item of result.data) {
                    let existingItemIndex = newChar[result.attributeName].findIndex((i) => {
                        return item.name == i.name;
                    });
                    if (existingItemIndex != -1) {
                        newChar[result.attributeName].splice(existingItemIndex, 1);
                    }
                }
                break;
            case HeroModificationType.ADD:
                /* leads, completedAdventures */
                newChar[result.attributeName] = newChar[result.attributeName].concat(result.data);
                newChar.latestModifications.push({attributeName: result.attributeName, data: null});
                break;
            case HeroModificationType.ADD_ACCOLADE:
                /* accolades */
                result.data.map((newAccolade: CharAccolade) => {
                    const existingAccolade: CharAccolade = newChar[result.attributeName].find(a => {
                        return a.type == newAccolade.type;
                    })
                    existingAccolade.received = existingAccolade.received.concat(newAccolade.received);
                    if (existingAccolade.received.length > 3) {
                        existingAccolade.received.splice(0, existingAccolade.received.length - 3);
                    }
                    newChar.latestModifications.push({attributeName: result.attributeName, data: newAccolade.type});
                })
                break;
                case HeroModificationType.ADD_AFFILIATION:
                /* affiliations */
                result.data.map((newAffiliation: AffiliationGenerationData) => {
                    let curAffiliationType = newChar.affiliations[newAffiliation.type];
                    (curAffiliationType as any[]).push(newAffiliation.object);

                    newChar.latestModifications.push({attributeName: result.attributeName, data: newAffiliation.type});
                })
                break;
        }
    }

    return newChar;
}

export function updateHeroState(hero: Hero): Hero {
    let newChar = deepCopyObject(hero);          // need to deep clone rather than using Object.assign() or spread operator

    newChar.marketSaturation = Math.min(newChar.marketSaturation, newChar.maxMarketSaturation);
    newChar.marketSaturation = Math.max(newChar.marketSaturation, 0);
    newChar.fatigue = Math.min(newChar.fatigue, newChar.maxFatigue);
    newChar.fatigue = Math.max(newChar.fatigue, 0);
    newChar.socialExposure = Math.min(newChar.socialExposure, newChar.maxSocialCapital);
    newChar.socialExposure = Math.max(newChar.socialExposure, 0);
    newChar.adventureProgress = Math.min(newChar.adventureProgress, newChar.currentAdventure.progressRequired);
    newChar.adventureProgress = Math.max(newChar.adventureProgress, 0);

    return newChar;
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
        type: HeroModificationType.INCREASE,
        attributeName: 'maxHp',
        data: Math.floor(hero.con / 3) + 1 + randRange(0, 3),
    });
    levelMods.push({
        type: HeroModificationType.INCREASE,
        attributeName: 'maxMp',
        data: Math.floor(hero.int / 3 ) + 1 + randRange(0, 3),
    })
    const winStat1 = selectLevelBonusStat(hero);
    const winStat2 = selectLevelBonusStat(hero);
    if (winStat1 === winStat2) {
        levelMods.push(generateStatModification(winStat1, 2));
    } else {
        levelMods.push(generateStatModification(winStat1));
        levelMods.push(generateStatModification(winStat2));
    }
    levelMods.push(generateSpellOrAbilityModification(hero));

    return levelMods;
}

function selectLevelBonusStat(hero: HeroStats): string {
    let selectedStat: string;
    const allStats = getHeroStatList();

    selectedStat = randFromList(allStats);
    if (randRange(0, 1)) {
        // Favor the best stat so it will tend to clump
        let i = 0;
        for (let curStat of allStats) {
            i += hero[curStat] ** 2;
        }
        i = randRange(0, i-1);
        for (let curStat of allStats) {
            selectedStat = curStat;
            i -= hero[curStat] ** 2;
            if (i < 0) {
                break;
            }
        }
    }

    return selectedStat;
}

function generateStatModification(attributeName: string, modValue: number = 1): HeroModification {
    const mod: HeroModification = {
        type: HeroModificationType.INCREASE,
        attributeName: attributeName,
        data: modValue,        
    }
    return mod;
}

export function generateSpellOrAbilityModification(hero: HeroStats & {level: number}, modValue: number = 1): HeroModification {
    let attributeName = '';
    let affectingStat = '';
    let optionList = [];
    let dataObj = {name: '', rank: modValue};
    if (randRange(0, 1)) {
        attributeName = 'spells';
        affectingStat = 'int';
        optionList = SPELLS;
    } else {
        attributeName = 'abilities';
        affectingStat = 'wis';
        optionList = ABILITIES;
    }
    // pick a spell/ability early in the list, weighted toward 0
    dataObj.name = randFromListLow(optionList, 2, hero.level + hero[affectingStat]);

    const mod: HeroModification = {
        type: HeroModificationType.ADD_RANK,
        attributeName: attributeName,
        data: [dataObj],
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

function generateRandomEquipment(targetLevel: number): CharEquipment {
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

function generateRandomAccolade(hero: Hero): CharAccolade {
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
    let titlePosition: CharTitlePosition;
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

interface AffiliationGenerationData {
    type: AffiliationType,
    object: CharConnection | CharMembership | CharOffice
}

function generateRandomAffiliation(hero: Hero): AffiliationGenerationData {
    let newAffiliationData: {type: AffiliationType, object: CharConnection | CharMembership | CharOffice};

    if (hero.affiliations[AffiliationType.OFFICES].length >= STANDARD_GROUPS_INDEFINITE.length) {
        // add a random non-duplicate Office for any Group with which the Hero has a Membership
        newAffiliationData = generateRandomNonDupOfficeObject(hero.affiliations);
    } else {
        let newAffiliationFactories: ((existingAffiliations: CharAffiliations) => AffiliationGenerationData)[] = [];
        if (hero.affiliations[AffiliationType.CONNECTIONS].length < STANDARD_GROUPS_INDEFINITE.length) {
            newAffiliationFactories.push(generateRandomDistinctConnection);
        }
        if (hero.affiliations[AffiliationType.MEMBERSHIPS].length < hero.affiliations[AffiliationType.CONNECTIONS].length) {
            newAffiliationFactories.push(generateRandomDistinctMembership);
        }
        if (hero.affiliations[AffiliationType.OFFICES].length < hero.affiliations[AffiliationType.MEMBERSHIPS].length) {
            newAffiliationFactories.push(generateRandomDistinctOffice);
        }

        
        let selectedFactory = randFromList(newAffiliationFactories);
        newAffiliationData = selectedFactory(hero.affiliations);
    }

    return newAffiliationData;
}

function generateRandomDistinctConnection(existingAffiliations: CharAffiliations): {type: AffiliationType, object: CharConnection} {
    const availableDistinctGroups: string[] = STANDARD_GROUPS_INDEFINITE.filter((groupName: string) => {
        return existingAffiliations[AffiliationType.CONNECTIONS].map(connection => connection.affiliatedGroupName).indexOf(groupName) === -1;
    });

    if (availableDistinctGroups.length === 0) {
        const nullConnection: CharConnection = {
            affiliatedPersonName: null,
            affiliatedPersonTitle: null,
            affiliatedGroupName: null,
        }
        return {type: AffiliationType.CONNECTIONS, object: nullConnection};
    }
    
    const newConnectionName = generateRandomName();
    const newConnectionTitle = randFromList(OFFICE_POSITIONS_ALL);
    const newGroupName = randFromList(availableDistinctGroups);
    const newConnection: CharConnection = {
        affiliatedPersonName: newConnectionName,
        affiliatedPersonTitle: newConnectionTitle,
        affiliatedGroupName: newGroupName,
    }
    const returnData = {
        type: AffiliationType.CONNECTIONS,
        object: newConnection,
    }
    return returnData;
}

function generateRandomDistinctMembership(existingAffiliations: CharAffiliations): {type: AffiliationType, object: CharMembership} {
    const availableMembershipGroups: string[] = existingAffiliations[AffiliationType.CONNECTIONS].map(connection => connection.affiliatedGroupName).filter((groupName: string) => {
        return existingAffiliations[AffiliationType.MEMBERSHIPS].map(membership => membership.affiliatedGroupName).indexOf(groupName) === -1;
    });

    if (availableMembershipGroups.length === 0) {
        return {type: AffiliationType.MEMBERSHIPS, object: {affiliatedGroupName: null}};
    }

    const newMembershipGroupName = randFromList(availableMembershipGroups);
    const newMembership: CharMembership = {
        affiliatedGroupName: newMembershipGroupName,
    };
    const returnData = {
        type: AffiliationType.MEMBERSHIPS,
        object: newMembership,
    }
    return returnData;
}

function generateRandomDistinctOffice(existingAffiliations: CharAffiliations): {type: AffiliationType, object: CharOffice} {
    const availableOfficeGroups: string[] = existingAffiliations[AffiliationType.MEMBERSHIPS].map(membership => membership.affiliatedGroupName).filter((groupName: string) => {
        return existingAffiliations[AffiliationType.OFFICES].map(office => office.affiliatedGroupName).indexOf(groupName) === -1;
    })
    
    if (availableOfficeGroups.length === 0) {
        const nullOffice: CharOffice = {
            officeTitleDescription: null,
            affiliatedGroupName: null,
        }
        return {type: AffiliationType.OFFICES, object: nullOffice};
    }
    
    const position = randFromList(OFFICE_POSITIONS_ALL);
    const group = randFromList(availableOfficeGroups);
    const officeObj: CharOffice = {
        officeTitleDescription: position,
        affiliatedGroupName: group,
    }
    const returnData = {
        type: AffiliationType.OFFICES,
        object: officeObj,
    }
    return returnData;
}

function generateRandomNonDupOfficeObject(existingAffiliations: CharAffiliations): {type: AffiliationType, object: CharOffice} {
    const group = randFromList(STANDARD_GROUPS_INDEFINITE);
    const existingOfficesForGroup: string[] = existingAffiliations[AffiliationType.OFFICES]
        .filter(office => office.affiliatedGroupName == group)
        .map(office => office.officeTitleDescription);
    const availableGroupOffices: string[] = OFFICE_POSITIONS_ALL.filter((office: string) => {
        return existingOfficesForGroup.indexOf(office) === -1;
    })

    const position = randFromList(availableGroupOffices);
    const officeObj: CharOffice = {
        officeTitleDescription: position,
        affiliatedGroupName: group,
    }
    
    const returnData = {
        type: AffiliationType.OFFICES,
        object: officeObj,
    }
    return returnData;
}
