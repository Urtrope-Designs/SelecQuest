import { Character, Task } from './models';

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
        equipment: [],
        accolades: [],
        affiliations: [],
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
        staminaSpent: 0,
        maxStamina: 35,
        socialExposure: 0,
        maxSocialCapital: 35,
        completedAdventures: [],
        adventureProgress: 0,
    }

    return newChar;
}
    
export function applyTaskResult(baseChar: Character, task: Task): Character {
    let newChar = Object.assign({}, baseChar);

    for (let attrib in task.results) {
        switch (attrib) {
            case 'str':
            case 'dex':
            case 'con':
            case 'int':
            case 'wis':
            case 'cha':
            case 'maxHp':
            case 'maxMp':
            case 'maxEncumbrance':
            case 'gold':
            case 'marketSaturation':
            case 'maxMarketSaturation':
                newChar[attrib] += task.results[attrib];
                break;
            case 'isInLootSelloffMode':
                newChar[attrib] = task.results[attrib];
                break;
            case 'spells':
                for (let item of task.results[attrib]) {
                    let existingItem = newChar[attrib].find((i) => {
                        return item.name == i.name;
                    });
                    if (!!existingItem) {
                        existingItem.rank += item.rank;
                    } else {
                        newChar[attrib].push(item);
                    }
                }
                break;
            case 'loot':
            case 'trophies':
                for (let item of task.results[attrib]) {
                    let existingItem = newChar[attrib].find((i) => {
                        return item.name == i.name;
                    })
                    if (!!existingItem) {
                        existingItem.quantity += item.quantity;
                        if (existingItem.quantity < 1) {
                            const existingItemIndex = newChar[attrib].indexOf(existingItem)
                            newChar[attrib].splice(existingItemIndex, 1);
                        }
                    } else {
                        newChar[attrib].push(item);
                    }
                }
                break;
        }
    }

    return newChar;
}

export function updateCharacterState(character: Character): Character {
    let newChar = Object.assign({}, character);

    const currentEncumbrance = character.loot.reduce((prevVal, curVal) => {
        return prevVal + curVal.quantity;
    }, 0)
    
    if (currentEncumbrance >= character.maxEncumbrance) {
        newChar.isInLootSelloffMode = true;
    }
    if (currentEncumbrance === 0) {
        newChar.isInLootSelloffMode = false;
    }

    newChar.marketSaturation = Math.min(newChar.marketSaturation, newChar.maxMarketSaturation);
    newChar.marketSaturation = Math.max(newChar.marketSaturation, 0);

    return newChar;
}
