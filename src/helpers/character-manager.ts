import { Character, CharacterModificationType, AccoladeType, AffiliationType, CharacterModification } from './models';
import { randRange } from './utils';

export function createNewCharacter(): Character {
    const newChar: Character = {
        name: 'Garg',
        race: 'Fartling',
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
        maxEncumbrance: 10,
        maxEquipmentIntegrity: 10,
        maxQuestLogSize: 10,
        gold: 0,
        renown: 0,
        spentRenown: 0,
        reputation: 0,
        spentReputation: 0,
        loot: [],
        trophies: [],
        leads: [],
        isInLootSelloffMode: false,
        isInTrophyBoastingMode: false,
        isInLeadFollowingMode: false,
        marketSaturation: 0,
        maxMarketSaturation: 35,
        fatigue: 0,
        maxFatigue: 35,
        socialExposure: 0,
        maxSocialCapital: 35,
        currentAdventure: {name: 'Prologue', progressRequired: 40},
        completedAdventures: [],
        adventureProgress: 0,
    }

    return newChar;
}
    
export function applyCharacterModifications(baseChar: Character, characterMods: CharacterModification[]): Character {
    let newChar = Object.assign({}, baseChar);

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
    let newChar = Object.assign({}, character);

    newChar.marketSaturation = Math.min(newChar.marketSaturation, newChar.maxMarketSaturation);
    newChar.marketSaturation = Math.max(newChar.marketSaturation, 0);
    newChar.fatigue = Math.min(newChar.fatigue, newChar.maxFatigue);
    newChar.fatigue = Math.max(newChar.fatigue, 0);
    newChar.socialExposure = Math.min(newChar.socialExposure, newChar.maxSocialCapital);
    newChar.socialExposure = Math.max(newChar.socialExposure, 0);

    return newChar;
}

export function getXpRequiredForNextLevel(curLevel: number): number {
    let xpRequired = 0;
    if (curLevel < XP_REQUIRED_FOR_NEXT_LEVEL.length) {
        xpRequired = XP_REQUIRED_FOR_NEXT_LEVEL[curLevel];
    } else {
        xpRequired = 36000 * (curLevel - 2);
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

export function getLevelUpModifications(): CharacterModification[] {
    let levelMods = [];

    levelMods.push({
        type: CharacterModificationType.INCREASE,
        attributeName: 'level',
        data: 1,
    });
    levelMods.push({
        type: CharacterModificationType.INCREASE,
        attributeName: 'maxHp',
        data: randRange(1, 4),
    });
    levelMods.push({
        type: CharacterModificationType.INCREASE,
        attributeName: 'maxMp',
        data: randRange(0, 2),
    })

    levelMods.push(LEVEL_UP_BONUSES[randRange(0, LEVEL_UP_BONUSES.length-1)]);
    if (!randRange(0, 3)) {
        levelMods.push(LEVEL_UP_BONUSES[randRange(0, LEVEL_UP_BONUSES.length-1)]);
    }

    return levelMods;
}

export function getAdventureCompletedModifications(character: Character): CharacterModification[] {

    const newAdventure = generateNewAdventure();
    const adventureMods = [
        {
            type: CharacterModificationType.SET,
            attributeName: 'currentAdventure',
            data: newAdventure,
        },
        {
            type: CharacterModificationType.SET,
            attributeName: 'adventureProgress',
            data: 0,
        },
        {
            type: CharacterModificationType.ADD,
            attributeName: 'completedAdventures',
            data: [character.currentAdventure.name],
        },
        {
            type: CharacterModificationType.ADD_RANK,
            attributeName: 'spells',
            data: [{name: 'Tonguehairs', rank: 1}],
        },
    ];

    return adventureMods;
}

let chapterInc = 1;
export function generateNewAdventure(): {name: string, progressRequired: number} {
    return {name: `Chapter ${chapterInc++}`, progressRequired: 60};
}

const XP_REQUIRED_FOR_NEXT_LEVEL = [
    0,
    30,
    12000,
    36000,
]

const LEVEL_UP_BONUSES = [
    {
        type: CharacterModificationType.INCREASE,
        attributeName: 'str',
        data: 1,
    },
    {
        type: CharacterModificationType.INCREASE,
        attributeName: 'dex',
        data: 1,
    },
    {
        type: CharacterModificationType.INCREASE,
        attributeName: 'con',
        data: 1,
    },
    {
        type: CharacterModificationType.INCREASE,
        attributeName: 'int',
        data: 1,
    },
    {
        type: CharacterModificationType.INCREASE,
        attributeName: 'wis',
        data: 1,
    },
    {
        type: CharacterModificationType.INCREASE,
        attributeName: 'cha',
        data: 1,
    },
]
