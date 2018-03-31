import { CharLoot } from "./models";
import { randRange, randSign, randFromList, makeStringIndefinite } from "./utils";

/**
 * LOOTING
 */
export enum LootingTargetType {
    LOCATION,
    MONSTER,
};

export interface LootingTarget {
    type: LootingTargetType,
    name: string,
    level: number,
    reward: string,
};

export let LOOTING_PARTICIPALS = [];
LOOTING_PARTICIPALS[LootingTargetType.LOCATION] = 'Ransacking';
LOOTING_PARTICIPALS[LootingTargetType.MONSTER] = 'Executing';

export let LOOTING_PREFIX_MINIMAL = [];
LOOTING_PREFIX_MINIMAL[LootingTargetType.LOCATION] = 'imaginary';
LOOTING_PREFIX_MINIMAL[LootingTargetType.MONSTER] = 'imaginary';

export let LOOTING_PREFIX_BAD_FIRST = [];
LOOTING_PREFIX_BAD_FIRST[LootingTargetType.LOCATION] = [
    'dank',
    'desolate',
    'vandalized',
    'cobwebby',
    'dreary',
];
LOOTING_PREFIX_BAD_FIRST[LootingTargetType.MONSTER] =[
    'dead',
    'comatose',
    'crippled',
    'sick',
    'undernourished',
];

export let LOOTING_PREFIX_BAD_SECOND = [];
LOOTING_PREFIX_BAD_SECOND[LootingTargetType.LOCATION] = [
    'abandoned',
    'underwhelming',
    'uninviting',
    'crumbling',
    'ramshackle',
];
LOOTING_PREFIX_BAD_SECOND[LootingTargetType.MONSTER] = [
    'foetal',
    'baby',
    'preadolescent',
    'teenage',
    'underage',
];

export let LOOTING_PREFIX_MAXIMAL = [];
LOOTING_PREFIX_MAXIMAL[LootingTargetType.LOCATION] = 'messianic';
LOOTING_PREFIX_MAXIMAL[LootingTargetType.MONSTER] = 'messianic';

export let LOOTING_PREFIX_GOOD_FIRST = [];
LOOTING_PREFIX_GOOD_FIRST[LootingTargetType.LOCATION] = [
    'posh',
    'thriving',
    'sturdy',
    'fortified',
    'sinister',
    'sprawling',
];
LOOTING_PREFIX_GOOD_FIRST[LootingTargetType.MONSTER] = [
    'greater',
    'massive',
    'enormous',
    'giant',
    'titanic',
];

export let LOOTING_PREFIX_GOOD_SECOND = [];
LOOTING_PREFIX_GOOD_SECOND[LootingTargetType.LOCATION] = [
    'booby-trapped',
    'ominous',
    'creepy',
    'newly renovated',
    'massive',
];
LOOTING_PREFIX_GOOD_SECOND[LootingTargetType.MONSTER] = [
    'veteran',
    'cursed',
    'warrior',
    'undead',
    'demon',
];

function determineTaskQuantity(targetLevel: number, taskLevel: number) {
    let quantity = 1;
    if (targetLevel - taskLevel > 10) {
        // target level is too low. multiply...
        quantity = Math.floor((targetLevel + randRange(0, taskLevel - 1)) / Math.max(taskLevel, 1));
        if (quantity < 1) {
            quantity = 1;
        }

    }
    return quantity
}

function applyTaskNameModifiers(targetLevel: number, taskTarget: LootingTarget): string {
    let taskName = taskTarget.name;

    if ((targetLevel - taskTarget.level) <= -10) {
        taskName = LOOTING_PREFIX_MINIMAL[taskTarget.type] + ' ' + taskName;
    } else if ((targetLevel - taskTarget.level) < -5) {
        const firstPrefix = randFromList(LOOTING_PREFIX_BAD_FIRST[taskTarget.type]);
        const secondPrefix = randFromList(LOOTING_PREFIX_BAD_SECOND[taskTarget.type]);
        taskName = firstPrefix + ' ' + secondPrefix + ' ' + taskName;
    } else if (((targetLevel - taskTarget.level) < 0) && (randRange(0, 1))) {
        taskName = randFromList(LOOTING_PREFIX_BAD_FIRST[taskTarget.type]) + ' ' + taskName;
    } else if (((targetLevel - taskTarget.level) < 0)) {
        taskName = randFromList(LOOTING_PREFIX_BAD_SECOND[taskTarget.type]) + ' ' + taskName;
    } else if ((targetLevel - taskTarget.level) >= 10) {
        taskName = LOOTING_PREFIX_MAXIMAL[taskTarget.type] + ' ' + taskName;
    } else if ((targetLevel - taskTarget.level) > 5) {
        const firstPrefix = randFromList(LOOTING_PREFIX_GOOD_FIRST[taskTarget.type]);
        const secondPrefix = randFromList(LOOTING_PREFIX_GOOD_SECOND[taskTarget.type]);
        taskName = firstPrefix + ' ' + secondPrefix + ' ' + taskName;
    } else if (((targetLevel - taskTarget.level) > 0) && (randRange(0, 1))) {
        taskName = randFromList(LOOTING_PREFIX_GOOD_FIRST[taskTarget.type]) + ' ' + taskName;
    } else if (((targetLevel - taskTarget.level) > 0)) {
        taskName = randFromList(LOOTING_PREFIX_GOOD_SECOND[taskTarget.type]) + ' ' + taskName;
    }

    return taskName;
}

//logic stolen pretty much directly from PQ
export function generateLootingTaskContentsFromLevel(level: number): {taskName: string, lootData: CharLoot[]} {
    let taskName = '';
    let lootData: CharLoot[] = [];

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
    let quantity = determineTaskQuantity(level, lootTarget.level);

    level = Math.floor(level / quantity);
  
    taskName = applyTaskNameModifiers(level, lootTarget);

    taskName = LOOTING_PARTICIPALS[lootTarget.type] + ' ' + makeStringIndefinite(taskName, quantity);

    lootData.push({
        name: lootTarget.reward,
        quantity: 1,
        value: 1,
    });

    return {taskName: taskName, lootData: lootData};
}

export const STANDARD_LOOTING_TARGETS: LootingTarget[] = [
    {
        type: LootingTargetType.LOCATION,
        name: 'Temple of Scutabrix',
        level: 1,
        reward: 'smug Scutabrix idol',
    },
    {
        type: LootingTargetType.LOCATION,
        name: 'Barber Shop',
        level: 1,
        reward: 'barber\'s pole',
    },
    {
        type: LootingTargetType.LOCATION,
        name: 'NagaMart',
        level: 2,
        reward: 'nagamart loyalty card',
    },
    {
        type: LootingTargetType.MONSTER,
        name: 'Orkey',
        level: 1,
        reward: 'orkey giblet',
    },
    {
        type: LootingTargetType.MONSTER,
        name: 'Frankenstork',
        level: 1,
        reward: 'frankenstork beak',
    },
    {
        type: LootingTargetType.MONSTER,
        name: 'Bison',
        level: 1,
        reward: 'bison beard',
    },
    {
        type: LootingTargetType.MONSTER,
        name: 'Mechanical marzipan',
        level: 1,
        reward: 'mechanical marzipan crumb',
    },
]

/** 
 * END LOOTING
 */

 /** 
  * GLADIATING
  */
