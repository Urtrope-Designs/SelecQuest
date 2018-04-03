import { CharLoot, CharTrophy } from "./models";
import { randRange, randSign, randFromList, makeStringIndefinite } from "./utils";

/**
 * GENERIC
 */
export enum TaskTargetType {
    LOCATION,
    MONSTER,
    DUEL,
    TRIAL,
    INTERROGATION,
    INVESTIGATION,
};

export let TASK_PARTICIPALS = [];
TASK_PARTICIPALS[TaskTargetType.LOCATION] = 'Ransacking';
TASK_PARTICIPALS[TaskTargetType.MONSTER] = 'Executing';
TASK_PARTICIPALS[TaskTargetType.DUEL] = 'Dueling';
TASK_PARTICIPALS[TaskTargetType.TRIAL] = 'Undertaking';

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

function randomizeTargetLevel(charLevel: number): number {
    let targetLevel = charLevel;
    for (let i = charLevel; i >= 1; --i) {
        if (randRange(1, 5) <= 2)
            targetLevel += randSign();
        }
    if (targetLevel < 1) {
        targetLevel = 1;
    } 

    return targetLevel;
}

/** select target with level closest to the targetLevel out of random selection of targets */
function randomizeTargetFromList(targetLevel: number, targetOptions: LootingTarget[] | GladiatingTarget[], numIterations: number = 6): LootingTarget | GladiatingTarget {
    if (numIterations < 1) {
        numIterations = 1;
    }
    let target = randFromList(targetOptions);
    for (let i = 0; i < numIterations - 1; i++) {
        let newTarget = randFromList(targetOptions);
        if (Math.abs(targetLevel - target.level) < Math.abs(targetLevel - newTarget.level)) {
            target = newTarget;
        }
    }

    return target;
}

/** END GENERIC */

/** 
 * LOOTING
 */

export interface LootingTarget {
    type: TaskTargetType,
    name: string,
    level: number,
    reward: string,
};

export let LOOTING_PREFIX_MINIMAL = [];
LOOTING_PREFIX_MINIMAL[TaskTargetType.LOCATION] = 'imaginary';
LOOTING_PREFIX_MINIMAL[TaskTargetType.MONSTER] = 'imaginary';

export let LOOTING_PREFIX_BAD_FIRST = [];
LOOTING_PREFIX_BAD_FIRST[TaskTargetType.LOCATION] = [
    'dank',
    'desolate',
    'vandalized',
    'cobwebby',
    'dreary',
];
LOOTING_PREFIX_BAD_FIRST[TaskTargetType.MONSTER] =[
    'dead',
    'comatose',
    'crippled',
    'sick',
    'undernourished',
];

export let LOOTING_PREFIX_BAD_SECOND = [];
LOOTING_PREFIX_BAD_SECOND[TaskTargetType.LOCATION] = [
    'abandoned',
    'underwhelming',
    'uninviting',
    'crumbling',
    'ramshackle',
];
LOOTING_PREFIX_BAD_SECOND[TaskTargetType.MONSTER] = [
    'foetal',
    'baby',
    'preadolescent',
    'teenage',
    'underage',
];

export let LOOTING_PREFIX_MAXIMAL = [];
LOOTING_PREFIX_MAXIMAL[TaskTargetType.LOCATION] = 'messianic';
LOOTING_PREFIX_MAXIMAL[TaskTargetType.MONSTER] = 'messianic';

export let LOOTING_PREFIX_GOOD_FIRST = [];
LOOTING_PREFIX_GOOD_FIRST[TaskTargetType.LOCATION] = [
    'posh',
    'thriving',
    'sturdy',
    'fortified',
    'sinister',
    'sprawling',
];
LOOTING_PREFIX_GOOD_FIRST[TaskTargetType.MONSTER] = [
    'greater',
    'massive',
    'enormous',
    'giant',
    'titanic',
];

export let LOOTING_PREFIX_GOOD_SECOND = [];
LOOTING_PREFIX_GOOD_SECOND[TaskTargetType.LOCATION] = [
    'booby-trapped',
    'ominous',
    'creepy',
    'newly renovated',
    'massive',
];
LOOTING_PREFIX_GOOD_SECOND[TaskTargetType.MONSTER] = [
    'veteran',
    'cursed',
    'warrior',
    'undead',
    'demon',
];

//logic stolen pretty much directly from PQ
export function generateLootingTaskContentsFromLevel(level: number): {taskName: string, lootData: CharLoot[]} {
    let taskName = '';
    let lootData: CharLoot[] = [];

    let targetLevel = randomizeTargetLevel(level);

    let lootTarget = randomizeTargetFromList(targetLevel, STANDARD_LOOTING_TARGETS, 6);

    let quantity = determineTaskQuantity(targetLevel, lootTarget.level);

    targetLevel = Math.floor(targetLevel / quantity);
  
    taskName = applyTaskNameModifiers(targetLevel, lootTarget);

    taskName = TASK_PARTICIPALS[lootTarget.type] + ' ' + makeStringIndefinite(taskName, quantity);

    lootData.push({
        name: lootTarget.reward,
        quantity: 1,
        value: 1,
    });

    return {taskName: taskName, lootData: lootData};
}

export const STANDARD_LOOTING_TARGETS: LootingTarget[] = [
    {
        type: TaskTargetType.LOCATION,
        name: 'Temple of Scutabrix',
        level: 1,
        reward: 'smug Scutabrix idol',
    },
    {
        type: TaskTargetType.LOCATION,
        name: 'Barber Shop',
        level: 1,
        reward: 'barber\'s cleaver',
    },
    {
        type: TaskTargetType.LOCATION,
        name: 'NagaMart',
        level: 2,
        reward: 'nagamart loyalty card',
    },
    {
        type: TaskTargetType.MONSTER,
        name: 'Orkey',
        level: 1,
        reward: 'orkey giblet',
    },
    {
        type: TaskTargetType.MONSTER,
        name: 'Frankenstork',
        level: 1,
        reward: 'frankenstork beak',
    },
    {
        type: TaskTargetType.MONSTER,
        name: 'Bison',
        level: 1,
        reward: 'bison beard',
    },
    {
        type: TaskTargetType.MONSTER,
        name: 'Mechanical marzipan',
        level: 1,
        reward: 'mechanical marzipan crumb',
    },
]

/** END LOOTING */

/** 
 * GLADIATING
 */

export interface GladiatingTarget {
    type: TaskTargetType,
    name: string,
    level: number,
    reward: string,
};

export function generateGladiatingTaskContentsFromLevel(level: number): {taskName: string, trophyData: CharTrophy[]} {
    let taskName = '';
    let trophyData: CharTrophy[] = [];

    let targetLevel = randomizeTargetLevel(level);

    if (randRange(0, 1)) {
        // dueling task

        // todo: randomize target's level (somehow)
        // todo: get random race/class combo (should be generic util function we can use on character creation screen)
        // todo: determine quantity based on target level and target's level
        // todo: build task name
        // todo: get reward from selected race

    } else {
        // trial task
        let gladiatingTarget;
        gladiatingTarget = randomizeTargetFromList(targetLevel, STANDARD_GLADIATING_TARGETS, 6);
        
        let quantity = determineTaskQuantity(targetLevel, gladiatingTarget.level);
        targetLevel = Math.floor(targetLevel / quantity);
      
        // todo: need to either fit trials into the mould of this function, or create a new function/modify the old one.
        taskName = applyTaskNameModifiers(targetLevel, gladiatingTarget);
    
        taskName = TASK_PARTICIPALS[gladiatingTarget.type] + ' ' + makeStringIndefinite(taskName, quantity);
    
        trophyData.push({
            name: gladiatingTarget.reward,
            quantity: 1,
            value: 1,
        });
    }


    return {taskName: taskName, trophyData: trophyData};
}

export const STANDARD_GLADIATING_TARGETS: GladiatingTarget[] = [
    {

    }
]
