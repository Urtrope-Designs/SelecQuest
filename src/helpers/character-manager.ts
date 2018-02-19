import { Character, Task } from './models';

export function createNewCharacter(): Character {
    const newChar: Character = {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
        maxHp: 10,
        maxMp: 0,
        maxEncumbrance: 10,
        spells: {},
        loot: {},
        trophies: {},
        gold: 0,
        isInLootSelloff: false,
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
                newChar[attrib] += task.results[attrib];
                break;
            case 'isInLootSelloff':
                newChar[attrib] = task.results[attrib];
                break;
            case 'spells':
                for (let spell in task.results[attrib]) {
                    if (!!newChar.spells[spell]) {
                        newChar.spells[spell].rank += task.results[attrib][spell].rank;
                    } else {
                        newChar.spells[spell] = task.results[attrib][spell];
                    }
                }
                break;
            case 'loot':
            case 'trophies':
                for (let item in task.results[attrib]) {
                    if (!!newChar[attrib][item]) {
                        newChar[attrib][item].quantity += task.results[attrib][item].quantity;
                        if (newChar[attrib][item].quantity < 1) {
                            delete newChar[attrib][item];
                        }
                    } else {
                        newChar[attrib][item] = task.results[attrib][item];
                    }
                }
                break;
        }
    }

    return newChar;
}

export function updateCharacterState(character: Character): Character {
    let newChar = Object.assign({}, character);

    const currentEncumbrance = Object.keys(character.loot).reduce((prevVal, curVal) => {
        return prevVal + character.loot[curVal].quantity;
    }, 0)
    
    if (currentEncumbrance >= character.maxEncumbrance) {
        newChar.isInLootSelloff = true;
    }

    return newChar;
}
