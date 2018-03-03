import { Character, Task, TaskResultType, AccoladeType, AffiliationType } from './models';

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
        completedAdventures: [],
        adventureProgress: 0,
    }

    return newChar;
}
    
export function applyTaskResult(baseChar: Character, task: Task): Character {
    let newChar = Object.assign({}, baseChar);

    for (let result of task.results) {
        switch(result.type) {
            case TaskResultType.INCREASE:
            case TaskResultType.DECREASE:
                newChar[result.attributeName] += result.data;
                break;
            case TaskResultType.SET:
                newChar[result.attributeName] = result.data;
                break;
            case TaskResultType.SET_EQUIPMENT:
                result.data.map((equip: {type: string, description: string}) => {
                    const existingEquipType = newChar[result.attributeName].find(e => {
                        return e.type == equip.type;
                    })
                    existingEquipType.description = equip.description;
                })
                break;
            case TaskResultType.ADD_RANK:
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
            case TaskResultType.ADD_QUANTITY:
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
            case TaskResultType.REMOVE_QUANTITY:
            case TaskResultType.REMOVE:
                for (let item of result.data) {
                    let existingItemIndex = newChar[result.attributeName].findIndex((i) => {
                        return item.name == i.name;
                    });
                    if (existingItemIndex != -1) {
                        newChar[result.attributeName].splice(existingItemIndex, 1);
                    }
                }
                break;
            case TaskResultType.ADD:
                newChar[result.attributeName] = newChar[result.attributeName].concat(result.data);
                break;
            case TaskResultType.ADD_ACCOLADE:
            case TaskResultType.ADD_AFFILIATION:
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
