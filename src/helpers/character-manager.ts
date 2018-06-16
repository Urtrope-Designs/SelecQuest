import { Character, CharacterModificationType, AccoladeType, AffiliationType, CharacterModification, getCharacterStatList, CharacterStats, CharEquipment, EquipmentType, EquipmentMaterial, CharAccolade, CharAffiliations, CharConnection, CharMembership, CharOffice } from './models';
import { randRange, randFromList, deepCopyObject, randFromListLow, randFromListHigh, generateRandomName } from './utils';
import { PROLOGUE_ADVENTURE_NAME } from './storyline-helpers';
import { SPELLS, ABILITIES, IS_DEBUG, WEAPON_MATERIALS, SHEILD_MATERIALS, ARMOR_MATERIALS, EPITHET_DESCRIPTORS, EPITHET_BEING_ALL, TITLE_POSITIONS_ALL, SOBRIQUET_MODIFIERS, SOBRIQUET_NOUN_PORTION, HONORIFIC_TEMPLATES, OFFICE_POSITIONS_ALL, STANDARD_GROUPS_INDEFINITE } from '../global/config';

export function createNewCharacter(): Character {
    const newChar: Character = {
        name: 'Garg',
        raceName: 'Fartling',
        class: 'Meter Beater',
        level: 1,
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
        maxHp: 10,
        maxMp: 0,
        currentXp: 0,
        spells: [],
        abilities: [],
        equipment: [
            {type: EquipmentType.Weapon, description: ''},
            {type: EquipmentType.Shield, description: ''},
            {type: EquipmentType.Helm, description: ''},
            {type: EquipmentType.Hauberk, description: ''},
            {type: EquipmentType.Brassairts, description: ''},
            {type: EquipmentType.Vambraces, description: ''},
            {type: EquipmentType.Gauntlets, description: ''},
            {type: EquipmentType.Gambeson, description: ''},
            {type: EquipmentType.Cuisses, description: ''},
            {type: EquipmentType.Greaves, description: ''},
            {type: EquipmentType.Sollerets, description: ''},
        ],
        accolades: [
            {type: AccoladeType.Epithets, received: []},
            {type: AccoladeType.Honorifics, received: []},
            {type: AccoladeType.Sobriquets, received: []},
            {type: AccoladeType.Titles, received: []},
        ],
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
                return 30 * (this.level + this.int);
            }
        },
        fatigue: 0,
        get maxFatigue() {
            if (IS_DEBUG) {
                return 35;
            } else {
                return 30 * (this.level + this.con);
            }
        },
        socialExposure: 0,
        get maxSocialCapital() {
            if (IS_DEBUG) {
                return 35;
            } else {
                return 30 * (this.level + this.wis);
            }
        },
        currentAdventure: {name: PROLOGUE_ADVENTURE_NAME, progressRequired: 28},
        completedAdventures: [],
        adventureProgress: 0,
    }

    return newChar;
}
    
export function applyCharacterModifications(baseChar: Character, characterMods: CharacterModification[]): Character {
    let newChar = deepCopyObject(baseChar);         // need to deep clone rather than using Object.assign() or spread operator

    for (let result of characterMods) {
        switch(result.type) {
            case CharacterModificationType.INCREASE:
            case CharacterModificationType.DECREASE:
                newChar[result.attributeName] += result.data;
                break;
            case CharacterModificationType.SET:
                newChar[result.attributeName] = result.data;
                break;
            case CharacterModificationType.SET_EQUIPMENT:
                result.data.map((equip: CharEquipment) => {
                    const existingEquipment = newChar[result.attributeName].find(e => {
                        return e.type == equip.type;
                    })
                    existingEquipment.description = equip.description;
                })
                break;
            case CharacterModificationType.ADD_RANK:
                for (let item of result.data) {
                    let existingItem = newChar[result.attributeName].find((i) => {
                        return item.name == i.name;
                    });
                    if (!!existingItem) {
                        existingItem.rank += item.rank;
                    } else {
                        newChar[result.attributeName].push(item);
                    }
                }
                break;
            case CharacterModificationType.ADD_QUANTITY:
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
                }
                break;
            case CharacterModificationType.REMOVE_QUANTITY:
            case CharacterModificationType.REMOVE:
                for (let item of result.data) {
                    let existingItemIndex = newChar[result.attributeName].findIndex((i) => {
                        return item.name == i.name;
                    });
                    if (existingItemIndex != -1) {
                        newChar[result.attributeName].splice(existingItemIndex, 1);
                    }
                }
                break;
            case CharacterModificationType.ADD:
                newChar[result.attributeName] = newChar[result.attributeName].concat(result.data);
                break;
            case CharacterModificationType.ADD_ACCOLADE:
                result.data.map((newA: {type: string, received: string[]}) => {
                    const existingA: {type: string, received: string[]} = newChar[result.attributeName].find(a => {
                        return a.type == newA.type;
                    })
                    existingA.received = existingA.received.concat(newA.received);
                    if (existingA.received.length > 3) {
                        existingA.received.splice(0, existingA.received.length - 3);
                    }
                })
                break;
            case CharacterModificationType.ADD_AFFILIATION:
                newChar.affiliations = {
                    [AffiliationType.CONNECTIONS]: Object.assign({}, newChar.affiliations[AffiliationType.CONNECTIONS], result.data[AffiliationType.CONNECTIONS]),
                    [AffiliationType.MEMBERSHIPS]: Object.assign({}, newChar.affiliations[AffiliationType.MEMBERSHIPS], result.data[AffiliationType.MEMBERSHIPS]),
                    [AffiliationType.OFFICES]: Object.assign({}, newChar.affiliations[AffiliationType.OFFICES], result.data[AffiliationType.OFFICES]),
                }
                break;
        }
    }

    return newChar;
}

export function updateCharacterState(character: Character): Character {
    let newChar = deepCopyObject(character);          // need to deep clone rather than using Object.assign() or spread operator

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

export function hasCharacterReachedNextLevel(character: Character): boolean {
    if (character.currentXp >= getXpRequiredForNextLevel(character.level)) {
        return true;
    } else {
        return false;
    }
}

export function getLevelUpModifications(character: Character): CharacterModification[] {
    let levelMods = [];

    levelMods.push({
        type: CharacterModificationType.INCREASE,
        attributeName: 'level',
        data: 1,
    });
    levelMods.push({
        type: CharacterModificationType.SET,
        attributeName: 'currentXp',
        data: 0,
    })
    levelMods.push({
        type: CharacterModificationType.INCREASE,
        attributeName: 'maxHp',
        data: Math.floor(character.con / 3) + 1 + randRange(0, 3),
    });
    levelMods.push({
        type: CharacterModificationType.INCREASE,
        attributeName: 'maxMp',
        data: Math.floor(character.int / 3 ) + 1 + randRange(0, 3),
    })
    const winStat1 = selectLevelBonusStat(character);
    const winStat2 = selectLevelBonusStat(character);
    if (winStat1 === winStat2) {
        levelMods.push(generateStatModification(winStat1, 2));
    } else {
        levelMods.push(generateStatModification(winStat1));
        levelMods.push(generateStatModification(winStat2));
    }
    levelMods.push(generateSpellOrAbilityModification(character));

    return levelMods;
}

function selectLevelBonusStat(character: CharacterStats): string {
    let selectedStat: string;
    const allStats = getCharacterStatList();

    selectedStat = randFromList(allStats);
    if (randRange(0, 1)) {
        // Favor the best stat so it will tend to clump
        let i = 0;
        for (let curStat of allStats) {
            i += character[curStat] ** 2;
        }
        i = randRange(0, i-1);
        for (let curStat of allStats) {
            selectedStat = curStat;
            i -= character[curStat] ** 2;
            if (i < 0) {
                break;
            }
        }
    }

    return selectedStat;
}

function generateStatModification(attributeName: string, modValue: number = 1): CharacterModification {
    const mod: CharacterModification = {
        type: CharacterModificationType.INCREASE,
        attributeName: attributeName,
        data: modValue,        
    }
    return mod;
}

export function generateSpellOrAbilityModification(character: CharacterStats & {level: number}, modValue: number = 1): CharacterModification {
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
    dataObj.name = randFromListLow(optionList, 2, character.level + character[affectingStat]);

    const mod: CharacterModification = {
        type: CharacterModificationType.ADD_RANK,
        attributeName: attributeName,
        data: [dataObj],
    }

    return mod;
}

export function generateNewEquipmentModification(character: Character): CharacterModification {
    const newEquipmentData = generateRandomEquipment(character.level);
    
    const mod: CharacterModification = {
        type: CharacterModificationType.SET_EQUIPMENT,
        attributeName: 'equipment',
        data: [newEquipmentData],
    };

    return mod;
}

function generateRandomEquipment(targetLevel: number): CharEquipment {
    //     randomly pick equipment type
    const newEquipmentType: EquipmentType = EquipmentType[randFromList(Object.keys(EquipmentType))];
    // 2. randomly pick 5 items of selected equipment type, & pick the one closest to character level
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

    // 3. add up to 2 modifiers (no duplicates) to bring quality of selected item closer to character level (don't allow it to go over)
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
    
    // 4. add remainder of difference (between quality of item adjusted by mods and character level) as numeric modifier.
    if (qualityDifference != 0) {
        newEquipmentDescription = `${qualityDifference > 0 ? '+' : ''}${qualityDifference} ${newEquipmentDescription}`;
    }

    const newEquipment = {
        type: newEquipmentType,
        description: newEquipmentDescription,
    };

    return newEquipment;
}

export function generateNewAccoladeModification(character: Character): CharacterModification {
    const newAccoladeData = generateRandomAccolade(character);
    
    const mod: CharacterModification = {
        type: CharacterModificationType.ADD_ACCOLADE,
        attributeName: 'accolades',
        data: [newAccoladeData],
    };

    return mod;
}

function generateRandomAccolade(character: Character): CharAccolade {
    const newAccoladeType = AccoladeType[randFromList(Object.keys(AccoladeType).filter(key => isNaN(+key)))];
    let newAccoladeDescription = '';
    switch(newAccoladeType) {
        case AccoladeType.Epithets:
            newAccoladeDescription = generateRandomEpithetDescription();
            break;
        case AccoladeType.Titles:
            newAccoladeDescription = generateRandomTitleDescription();
            break;
        case AccoladeType.Sobriquets:
            newAccoladeDescription = generateRandomSobriquetDescription(character.accolades[AccoladeType.Sobriquets].received.join(''));
            break;
        case AccoladeType.Honorifics:
            newAccoladeDescription = generateRandomHonorificDescription(character.level, character.name);
            break;
    }

    const newAccolade = {
        type: newAccoladeType,
        received: [newAccoladeDescription]
    }

    return newAccolade;
}

function generateRandomEpithetDescription() {
    let epithetDescription = `${randFromList(EPITHET_DESCRIPTORS)} ${randFromList(EPITHET_BEING_ALL)}`;
    return epithetDescription;
};
function generateRandomTitleDescription() {
    const titlePosition = randFromList(TITLE_POSITIONS_ALL);
    const titleObject = randFromList(titlePosition.titleObjectList);
    const titleDescription = `${titlePosition.description} of ${titleObject}`;

    return titleDescription;
}
function generateRandomSobriquetDescription(exclusions: string) {
    let modifier = ''
    do {
        modifier = randFromList(SOBRIQUET_MODIFIERS);
    } while (exclusions.toLocaleLowerCase().includes(modifier));

    // one or two (twice as likely) SOBRIQUET_NOUN_PORTIONs
    let noun = '';
    for (let i = 0; i < (randRange(0, 2) || 2); i++) {
        let nounPortion = '';
        do {
            nounPortion = randFromList(SOBRIQUET_NOUN_PORTION);
        } while (exclusions.toLocaleLowerCase().includes(nounPortion) || noun.includes(nounPortion));
        noun += nounPortion;
    }

    // capitalize
    noun = noun[0].toLocaleUpperCase() + noun.slice(1);

    
    const sobriquetDescription = `${modifier} ${noun}`;
    return sobriquetDescription;
}
function generateRandomHonorificDescription(targetLevel: number, heroName: string) {
    const honorificTemplate = randFromListHigh(HONORIFIC_TEMPLATES, 2, targetLevel - 2, targetLevel + 2);

    const honorificDescription = honorificTemplate.replace('%NAME%', heroName);
    
    return honorificDescription;
}

export function generateNewAffiliationModification(character: Character): CharacterModification {
    const newAffiliationData = generateRandomAffiliation(character);

    const mod = {
        type: CharacterModificationType.ADD_AFFILIATION,
        attributeName: 'affiliations',
        data: [newAffiliationData],
    };

    return mod;
}

function generateRandomAffiliation(character: Character): {[key: string]: CharConnection | CharMembership | CharOffice} {
    let newAffiliationType: AffiliationType;
    let newAffiliationObj: CharConnection | CharMembership | CharOffice;

    if (character.affiliations[AffiliationType.OFFICES].length >= STANDARD_GROUPS_INDEFINITE.length) {
        // upgrade an existing office
        newAffiliationObj = generateUpgradedOffice(character.affiliations);
        if (newAffiliationObj == null) {
            // add a random non-duplicate Office for any Group with which the Hero has a Membership
        }
        newAffiliationType = AffiliationType.OFFICES;
    } else {
        let newAffiliationFactories: ((existingAffiliations: CharAffiliations) => {type: AffiliationType, obj: CharConnection | CharMembership | CharOffice})[] = [];
        if (character.affiliations[AffiliationType.CONNECTIONS].length < STANDARD_GROUPS_INDEFINITE.length) {
            newAffiliationFactories.push(generateRandomDistinctConnection);
        }
        if (character.affiliations[AffiliationType.MEMBERSHIPS].length < character.affiliations[AffiliationType.CONNECTIONS].length) {
            newAffiliationFactories.push(generateRandomDistinctMembership);
        }
        if (character.affiliations[AffiliationType.OFFICES].length < character.affiliations[AffiliationType.MEMBERSHIPS].length) {
            newAffiliationFactories.push(generateRandomRandomDistinctOffice);
        }

        
        let selectedFactory = randFromList(newAffiliationFactories);
        let newAffiliationData = selectedFactory(character.affiliations);
        newAffiliationType = newAffiliationData.type;
        newAffiliationObj = newAffiliationData.obj;
    }

    const affiliationsObj = {
        [newAffiliationType]: newAffiliationObj,
    };

    return affiliationsObj;
}

function generateRandomDistinctConnection(existingAffiliations: CharAffiliations): {type: AffiliationType, obj: CharConnection} {
    const availableDistinctGroups: string[] = STANDARD_GROUPS_INDEFINITE.filter((groupName: string) => {
        return existingAffiliations.connections.map(connection => connection.affiliatedGroupName).indexOf(groupName) === -1;
    });

    if (availableDistinctGroups.length === 0) {
        const nullConnection: CharConnection = {
            affiliatedPersonName: null,
            affiliatedPersonTitle: null,
            affiliatedGroupName: null,
        }
        return {type: AffiliationType.CONNECTIONS, obj: nullConnection};
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
        obj: newConnection,
    }
    return returnData;
}

function generateRandomDistinctMembership(existingAffiliations: CharAffiliations): {type: AffiliationType, obj: CharMembership} {
    const availableMembershipGroups: string[] = existingAffiliations.connections.map(connection => connection.affiliatedGroupName).filter((groupName: string) => {
        return existingAffiliations.memberships.map(membership => membership.affiliatedGroupName).indexOf(groupName) === -1;
    });

    if (availableMembershipGroups.length === 0) {
        return {type: AffiliationType.MEMBERSHIPS, obj: {affiliatedGroupName: null}};
    }

    const newMembershipGroupName = randFromList(availableMembershipGroups);
    const newMembership: CharMembership = {
        affiliatedGroupName: newMembershipGroupName,
    };
    const returnData = {
        type: AffiliationType.MEMBERSHIPS,
        obj: newMembership,
    }
    return returnData;
}

function generateRandomRandomDistinctOffice(existingAffiliations: CharAffiliations): {type: AffiliationType, obj: CharOffice} {
    const availableTitles: string[] = OFFICE_POSITIONS_ALL.filter((position: string) => {
        return existingAffiliations.offices.map(office => office.officeTitleDescription).indexOf(position) === -1;
    });
    
    const availableOfficeGroups: string[] = existingAffiliations.memberships.map(membership => membership.affiliatedGroupName).filter((groupName: string) => {
        return existingAffiliations.offices.map(office => office.affiliatedGroupName).indexOf(groupName) === -1;
    })
    
    if (availableTitles.length === 0 || availableOfficeGroups.length === 0) {
        const nullOffice: CharOffice = {
            officeTitleDescription: null,
            affiliatedGroupName: null,
        }
        return {type: AffiliationType.OFFICES, obj: nullOffice};
    }
    
    const position = randFromList(availableTitles);
    const group = randFromList(availableOfficeGroups);
    const officeObj: CharOffice = {
        officeTitleDescription: position,
        affiliatedGroupName: group,
    }
    const returnData = {
        type: AffiliationType.OFFICES,
        obj: officeObj,
    }
    return returnData;
}