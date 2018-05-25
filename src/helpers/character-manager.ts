import { Character, CharacterModificationType, AccoladeType, AffiliationType, CharacterModification, getCharacterStatList } from './models';
import { randRange, randFromList, deepCopyObject } from './utils';
import { PROLOGUE_ADVENTURE_NAME } from './storyline-helpers';
import { SPELLS, ABILITIES, IS_DEBUG } from '../global/config';

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
            {type: 'Weapon', description: ''},
            {type: 'Shield', description: ''},
            {type: 'Helm', description: ''},
            {type: 'Hauberk', description: ''},
            {type: 'Brassairts', description: ''},
            {type: 'Vambraces', description: ''},
            {type: 'Gauntlets', description: ''},
            {type: 'Gambeson', description: ''},
            {type: 'Cuisses', description: ''},
            {type: 'Greaves', description: ''},
            {type: 'Sollerets', description: ''},
        ],
        accolades: [
            {type: AccoladeType.Epithets, received: []},
            {type: AccoladeType.Honorifics, received: []},
            {type: AccoladeType.Sobriquets, received: []},
            {type: AccoladeType.Titles, received: []},
        ],
        affiliations: [
            {type: AffiliationType.Affiliations, received: []},
            {type: AffiliationType.Connections, received: []},
            {type: AffiliationType.Offices, received: []},
        ],
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
                result.data.map((equip: {type: string, description: string}) => {
                    const existingEquipType = newChar[result.attributeName].find(e => {
                        return e.type == equip.type;
                    })
                    existingEquipType.description = equip.description;
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
            case CharacterModificationType.ADD_AFFILIATION:
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

function selectLevelBonusStat(character: Character): string {
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

function generateSpellOrAbilityModification(character: Character, modValue: number = 1): CharacterModification {
    let attributeName = '';
    let dataObj = {name: '', rank: modValue};
    if (randRange(0, 1)) {
        attributeName = 'spells';
        // pick a spell early in the list, limited by int + level, and weighted toward 0
        let spellIndex = Math.min(randRange(0, character.int + character.level), randRange(0, character.int + character.level), SPELLS.length-1);
        dataObj.name = SPELLS[spellIndex]; 
    } else {
        attributeName = 'abilities';
        // pick an ability early in the list, limited by wisdom + level, and weighted toward 0
        let abilityIndex = Math.min(randRange(0, character.wis + character.level), randRange(0, character.wis + character.level), ABILITIES.length-1);
        dataObj.name = ABILITIES[abilityIndex]; 
    }

    const mod: CharacterModification = {
        type: CharacterModificationType.ADD_RANK,
        attributeName: attributeName,
        data: [dataObj],
    }

    return mod;
}
