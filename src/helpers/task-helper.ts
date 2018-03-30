import { CharLoot } from "./models";
import { randRange, randSign, randFromList } from "./utils";

//logic stolen pretty much directly from PQ
export function generateLootingTaskContentsFromLevel(level: number): {taskName: string, lootData: CharLoot[]} {
    let taskName = '';
    let lootData = [];

    // randomize desired level
    for (let i = level; i >= 1; --i) {
        if (randRange(1,5) <= 2)
            level += randSign();
        }
    if (level < 1) level = 1;

    // select target with level closest to the desired out of random selection of targets
    let lootTarget = randFromList(STANDARD_LOOTING_TARGETS);
    for (let i = 0; i < 5; i++) {
        let newTarget = randFromList(STANDARD_LOOTING_TARGETS);
        if (Math.abs(level - lootTarget.level) < Math.abs(level - newTarget.level)) {
            lootTarget = newTarget;
        }
    }

    // determine quantity
    let qty = 1;
    if (level - lootTarget.level > 10) {
        // target level is too low. multiply...
        qty = Math.floor((level + randRange(0, lootTarget.level - 1)) / Math.max(lootTarget.level, 1));
        if (qty < 1) {
            qty = 1;
        }
        level = Math.floor(level / qty);
    }
  
    if ((level - lootTarget.level) <= -10) {
        result = 'imaginary ' + result;
    } else if ((level - lootTarget.level) < -5) {
        i = 10 + (level - lootTarget.level);
        i = 5 - Random(i+1);
        result = Sick(i,Young((lootTarget.level-level)-i,result));
    } else if (((level-lootTarget.level) < 0) && (Random(2) == 1)) {
        result = Sick(level-lootTarget.level,result);
    } else if (((level-lootTarget.level) < 0)) {
        result = Young(level-lootTarget.level,result);
    } else if ((level-lootTarget.level) >= 10) {
        result = 'messianic ' + result;
    } else if ((level-lootTarget.level) > 5) {
        i = 10-(level-lootTarget.level);
        i = 5-Random(i+1);
        result = Big(i,Special((level-lootTarget.level)-i,result));
    } else if (((level-lootTarget.level) > 0) && (Random(2) == 1)) {
        result = Big(level-lootTarget.level,result);
    } else if (((level-lootTarget.level) > 0)) {
        result = Special(level-lootTarget.level,result);
    }

    return {taskName: taskName, lootData: lootData};
}

export enum LootingTargetType {
    LOCATION,
    MONSTER,
}

export interface LootingTarget {
    type: LootingTargetType,
    name: string,
    level: number,
    reward: string,
};

export const STANDARD_LOOTING_TARGETS: LootingTarget[] = [
    {
        type: LootingTargetType.LOCATION,
        name: 'Temple of Scutabrix',
        level: 1,
        reward: 'Smug Idol of Scutabrix',
    },
    {
        type: LootingTargetType.LOCATION,
        name: 'Barber Shop',
        level: 1,
        reward: 'Barber\'s Pole',
    },
    {
        type: LootingTargetType.MONSTER,
        name: 'Orkey',
        level: 1,
        reward: 'giblet',
    },
    {
        type: LootingTargetType.MONSTER,
        name: 'Frankenstork',
        level: 1,
        reward: 'beak',
    },
]