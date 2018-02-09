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
        maxEncumbrance: 15,
        spells: {},
        loot: {},
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
                newChar[attrib] += task.results[attrib];
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
                for (let item in task.results[attrib]) {
                    if (!!newChar.loot[item]) {
                        newChar.loot[item].quantity += task.results[attrib].quantity;
                    } else {
                        newChar.loot[item] = task.results[attrib][item];
                    }
                }
                break;
        }
    }

    return newChar;
}
