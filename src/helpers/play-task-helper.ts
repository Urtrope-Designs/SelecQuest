import { CharLoot, CharTrophy, LootingTarget, GladiatingTarget, TaskTargetType, CharLead, LeadType, LeadTarget, HeroModification, HeroModificationType, TaskMode, AppState, Task } from "./models";
import { randRange, randSign, randFromList, makeStringIndefinite, generateRandomName, makeVerbGerund, capitalizeInitial } from "./utils";
import { TASK_PREFIX_MINIMAL, TASK_PREFIX_BAD_FIRST, TASK_PREFIX_BAD_SECOND, TASK_PREFIX_MAXIMAL, TASK_PREFIX_GOOD_FIRST, TASK_PREFIX_GOOD_SECOND, TASK_GERUNDS, STANDARD_GLADIATING_TARGETS, STANDARD_LOOTING_TARGETS, RACES, CLASSES, STANDARD_LEAD_GATHERING_TARGETS, STANDARD_LEAD_TARGETS, IS_DEBUG, LEAD_GATHERING_TASK_MODIFIERS } from "../global/config";
import { PROLOGUE_TASKS, PROLOGUE_ADVENTURE_NAME, generateNextAdventureName } from './storyline-helpers';
import { generateNewEquipmentModification, generateSpellOrAbilityModification, generateNewAccoladeModification, generateNewAffiliationModification } from './hero-manager';

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
    const NEEDS_PREFIX_SEPARATOR = taskTarget.type == TaskTargetType.LOCATION || taskTarget.type == TaskTargetType.TRIAL;

    if ((targetLevel - taskTarget.level) <= -10) {
        taskName = TASK_PREFIX_MINIMAL[taskTarget.type] + ' ' + taskName;
    } else if ((targetLevel - taskTarget.level) < -5) {
        const firstPrefix = randFromList(TASK_PREFIX_BAD_FIRST[taskTarget.type]);
        const secondPrefix = randFromList(TASK_PREFIX_BAD_SECOND[taskTarget.type]);
        const prefixSeparator = NEEDS_PREFIX_SEPARATOR ? ', ' : ' ';
        taskName = firstPrefix + prefixSeparator + secondPrefix + ' ' + taskName;
    } else if (((targetLevel - taskTarget.level) < 0) && (randRange(0, 1))) {
        taskName = randFromList(TASK_PREFIX_BAD_FIRST[taskTarget.type]) + ' ' + taskName;
    } else if (((targetLevel - taskTarget.level) < 0)) {
        taskName = randFromList(TASK_PREFIX_BAD_SECOND[taskTarget.type]) + ' ' + taskName;
    } else if ((targetLevel - taskTarget.level) >= 10) {
        taskName = TASK_PREFIX_MAXIMAL[taskTarget.type] + ' ' + taskName;
    } else if ((targetLevel - taskTarget.level) > 5) {
        const firstPrefix = randFromList(TASK_PREFIX_GOOD_FIRST[taskTarget.type]);
        const secondPrefix = randFromList(TASK_PREFIX_GOOD_SECOND[taskTarget.type]);
        const prefixSeparator = NEEDS_PREFIX_SEPARATOR ? ', ' : ' ';
        taskName = firstPrefix + prefixSeparator + secondPrefix + ' ' + taskName;
    } else if (((targetLevel - taskTarget.level) > 0) && (randRange(0, 1))) {
        taskName = randFromList(TASK_PREFIX_GOOD_FIRST[taskTarget.type]) + ' ' + taskName;
    } else if (((targetLevel - taskTarget.level) > 0)) {
        taskName = randFromList(TASK_PREFIX_GOOD_SECOND[taskTarget.type]) + ' ' + taskName;
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

//logic stolen pretty much directly from PQ
export function generateLootingTaskContentsFromLevel(level: number): {taskName: string, taskLevel: number, lootData: CharLoot[]} {
    let taskName = '';
    let lootData: CharLoot[] = [];

    let targetLevel = randomizeTargetLevel(level);

    let lootTarget = randomizeTargetFromList(targetLevel, STANDARD_LOOTING_TARGETS, 6);

    let quantity = determineTaskQuantity(targetLevel, lootTarget.level);

    targetLevel = Math.floor(targetLevel / quantity);
  
    taskName = applyTaskNameModifiers(targetLevel, lootTarget);

    taskName = TASK_GERUNDS[lootTarget.type] + ' ' + makeStringIndefinite(taskName, quantity);

    lootData.push({
        name: lootTarget.reward,
        quantity: 1,
        value: 1,
    });

    return {taskName: taskName, taskLevel: targetLevel * quantity, lootData: lootData};
}

export function generateGladiatingTaskContentsFromLevel(level: number): {taskName: string, taskLevel: number, trophyData: CharTrophy[]} {
    let taskName = '';
    let trophyData: CharTrophy[] = [];

    let targetLevel = randomizeTargetLevel(level);
    let taskLevel = targetLevel;

    if (randRange(0, 1)) {
        // dueling task
        let foeLevel = randomizeTargetLevel(level);
        let foeRace = randFromList(RACES);
        let foeClass = randFromList(CLASSES);
        let quantity = determineTaskQuantity(targetLevel, foeLevel);
        if (quantity === 1) {
            let foeName = generateRandomName();
            taskName = `${TASK_GERUNDS[TaskTargetType.DUEL]} ${foeName}, the ${foeRace.raceName} ${foeClass}`;
        }
        else {
            taskName = TASK_GERUNDS[TaskTargetType.DUEL] + ' ' + makeStringIndefinite(`level ${foeLevel} ${foeRace.raceName} ${foeClass}`, quantity);
        }
        taskLevel = foeLevel * quantity;
        
        trophyData.push({
            name: foeRace.raceName + ' ' + foeRace.trophyName,
            quantity: 1,
            value: 1,
        })

    } else {
        // trial task
        let gladiatingTarget;
        gladiatingTarget = randomizeTargetFromList(targetLevel, STANDARD_GLADIATING_TARGETS, 6);
        
        let quantity = determineTaskQuantity(targetLevel, gladiatingTarget.level);
        targetLevel = Math.floor(targetLevel / quantity);
      
        // todo: need to either fit trials into the mould of this function, or create a new function/modify the old one.
        taskName = applyTaskNameModifiers(targetLevel, gladiatingTarget);
    
        taskName = TASK_GERUNDS[gladiatingTarget.type] + ' ' + makeStringIndefinite(taskName, quantity);

        taskLevel = targetLevel * quantity;

        trophyData.push({
            name: capitalizeInitial(gladiatingTarget.reward),
            quantity: 1,
            value: 1,
        });
    }

    return {taskName: taskName, taskLevel: taskLevel, trophyData: trophyData};
}

export function generateInvestigatingTaskContents(): {taskName: string, leadData: CharLead[]} {
    let investigatingTaskName = '';
    let leadData = [];

    const investigatingTarget = randFromList(STANDARD_LEAD_GATHERING_TARGETS);

    investigatingTaskName = capitalizeInitial(`${investigatingTarget.gerundPhrase} ${randFromList(investigatingTarget.predicateOptions)}`);

    const leadTargetType: LeadType = randFromList(investigatingTarget.leadTypes);
    const leadTarget: LeadTarget = randFromList(STANDARD_LEAD_TARGETS[leadTargetType]);

    const leadPredicate = leadTarget.predicateFactory.apply(null);
    const lead: CharLead = {
        questlogName: capitalizeInitial(`${leadTarget.verb} ${leadPredicate}`),
        taskName: capitalizeInitial(`${makeVerbGerund(leadTarget.verb)} ${leadPredicate}`),
        value: 1,
    }

    leadData.push(lead);

    return {taskName: investigatingTaskName, leadData: leadData};
}

export function getTradeInCostForLevel(level: number): number {
    return IS_DEBUG ? 25 : 5 * level**2 + 10 * level + 20;
}

export interface TaskGenerator {
    priority: number;
    shouldRun: (state: AppState) => boolean;
    generateTask: (state: AppState) => Task;
}

const lootingTaskGen: TaskGenerator = {
    priority: 0,
    shouldRun: (/*state: AppState*/) => {
        return true;
    },
    generateTask: (state: AppState) => {
        const {taskName, taskLevel, lootData} = generateLootingTaskContentsFromLevel(state.hero.level);
        const durationSeconds = Math.floor(6 * taskLevel / state.hero.level);
        const isMarketSaturated = state.hero.marketSaturation >= state.hero.maxMarketSaturation;
        const results: HeroModification[] = [
            {
                type: HeroModificationType.ADD_QUANTITY,
                attributeName: 'loot',
                data: lootData,
            },
            {
                type: HeroModificationType.DECREASE,
                attributeName: 'fatigue',
                data: -2,
            },
            {
                type: HeroModificationType.DECREASE,
                attributeName: 'socialExposure',
                data: -2,
            },
            {
                type: HeroModificationType.INCREASE,
                attributeName: 'currentXp',
                data: (Math.ceil(durationSeconds / (isMarketSaturated ? 2 : 1))),
            },
            {
                type: HeroModificationType.INCREASE,
                attributeName: 'adventureProgress',
                data: (Math.ceil(durationSeconds / (isMarketSaturated ? 2 : 1))),
            },
        ]
        const newTask = {
            description: taskName,
            durationMs: durationSeconds * 1000,
            results: results
        };
        return newTask;
    },
};

const triggerSelloffTaskGen: TaskGenerator = {
    priority: 2,
    shouldRun: (state: AppState) => {
        if (state.activeTaskMode !== TaskMode.LOOTING) {
            return false;
        }

        const currentEncumbrance = state.hero.loot.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEncumbrance >= state.hero.maxEncumbrance;
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: 'Heading to market to pawn your loot',
            durationMs: 4 * 1000,
            results: [
                {
                    type: HeroModificationType.SET,
                    attributeName: 'isInLootSelloffMode',
                    data: true,
                }
            ]
        }

        return newTask;
    }
};

const selloffTaskGen: TaskGenerator = {
    priority: 3,
    shouldRun: (state: AppState) => {
        return state.activeTaskMode == TaskMode.LOOTING && state.hero.isInLootSelloffMode;
    },
    generateTask: (state: AppState) => {
        const sellItem = state.hero.loot[0];
        if (!!sellItem) {
            const isMarketSaturated = state.hero.marketSaturation >= state.hero.maxMarketSaturation;
            const sellQuantity = sellItem.quantity;
            const sellValue = Math.ceil((sellQuantity * sellItem.value * state.hero.level) / (isMarketSaturated ? 2 : 1));
            let lootData = [
                {
                    name: sellItem.name,
                    quantity: -1 * sellQuantity,
                    value: 0
                }
            ];
            const results: HeroModification[] = [
                {
                    type: HeroModificationType.REMOVE,
                    attributeName: 'loot',
                    data: lootData,
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'gold',
                    data: sellValue,
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'marketSaturation',
                    data: sellQuantity,
                },
            ]

            const newTask = {
                description: 'Selling ' + makeStringIndefinite(sellItem.name, sellItem.quantity),
                durationMs: 1000,
                results: results,
            }
            return newTask;
        } else {
            const newTask = {
                description: 'Cleanup',
                durationMs: 10,
                results: [
                    {
                        type: HeroModificationType.SET,
                        attributeName: 'isInLootSelloffMode',
                        data: false,
                    }
                ],
            }
            return newTask;
        }
    }
};

const endSelloffTaskGen: TaskGenerator = {
    priority: 4,
    shouldRun: (state: AppState) => {
        if (state.activeTaskMode !== TaskMode.LOOTING || !state.hero.isInLootSelloffMode) {
            return false;
        }

        const currentEncumbrance = state.hero.loot.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEncumbrance <= 0;
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: 'Heading out to find some swag',
            durationMs: 4 * 1000,
            results: [
                {
                    type: HeroModificationType.SET,
                    attributeName: 'isInLootSelloffMode',
                    data: false,
                }
            ]
        }

        return newTask;
    },
};

const purchaseEquipmentTaskGen: TaskGenerator = {
    priority: 5,
    shouldRun: (state: AppState) => {
        if (state.activeTaskMode !== TaskMode.LOOTING || !state.hero.isInLootSelloffMode) {
            return false;
        }

        const currentEncumbrance = state.hero.loot.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        const minGold = getTradeInCostForLevel(state.hero.level);
        return currentEncumbrance <= 0 && state.hero.gold >= minGold;
    },
    generateTask: (state: AppState) => {
        const newEquipmentMod = generateNewEquipmentModification(state.hero);
        const newTask: Task = {
            description: 'Negotiating the purchase of better equipment',
            durationMs: 5 * 1000,
            results: [
                newEquipmentMod,
                {
                    type: HeroModificationType.DECREASE,
                    attributeName: 'gold',
                    data: -getTradeInCostForLevel(state.hero.level),
                },
            ]
        }
        return newTask;
    },
};

const gladiatingTaskGen: TaskGenerator = {
    priority: 1,
    shouldRun: (state: AppState) => {
        return state.activeTaskMode == TaskMode.GLADIATING;
    },
    generateTask: (state: AppState) => {
        const {taskName, taskLevel, trophyData} = generateGladiatingTaskContentsFromLevel(state.hero.level);
        const durationSeconds = Math.floor(6 * taskLevel / state.hero.level);
        const isFatigued = state.hero.fatigue >= state.hero.maxFatigue;
        const results: HeroModification[] = [
            {
                type: HeroModificationType.ADD_QUANTITY,
                attributeName: 'trophies',
                data: trophyData,
            },
            {
                type: HeroModificationType.INCREASE,
                attributeName: 'fatigue',
                data: 1,
            },
            {
                type: HeroModificationType.DECREASE,
                attributeName: 'marketSaturation',
                data: -2,
            },
            {
                type: HeroModificationType.DECREASE,
                attributeName: 'socialExposure',
                data: -2,
            },
            {
                type: HeroModificationType.INCREASE,
                attributeName: 'currentXp',
                data: (Math.ceil(durationSeconds / (isFatigued ? 2 : 1))),
            },
            {
                type: HeroModificationType.INCREASE,
                attributeName: 'adventureProgress',
                data: (Math.ceil(durationSeconds / (isFatigued ? 2 : 1))),
            },
        ]

        const newTask = {
            description: taskName,
            durationMs: durationSeconds * 1000,
            results: results
        };
        return newTask;
    }
};

const triggerBoastingTaskGen: TaskGenerator = {
    priority: 2,
    shouldRun: (state: AppState) => {
        if (state.activeTaskMode !== TaskMode.GLADIATING) {
            return false;
        }

        const currentEquipmentWear = state.hero.trophies.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEquipmentWear >= state.hero.maxEquipmentWear;
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: 'Heading to the nearest inn to boast of your recent deeds while your armor is repaired',
            durationMs: 4 * 1000,
            results: [
                {
                    type: HeroModificationType.SET,
                    attributeName: 'isInTrophyBoastingMode',
                    data: true,
                }
            ]
        }

        return newTask;
    }
};

const boastingTaskGen: TaskGenerator = {
    priority: 3,
    shouldRun: (state: AppState) => {
        return state.activeTaskMode === TaskMode.GLADIATING && state.hero.isInTrophyBoastingMode;
    },
    generateTask: (state: AppState) => {
        const boastItem = state.hero.trophies[0];
        if (!!boastItem) {
            const isFatigued = state.hero.fatigue >= state.hero.maxFatigue;
            const boastQuantity = boastItem.quantity;
            const renownValue = Math.ceil((boastQuantity * boastItem.value * state.hero.level) / (isFatigued ? 2 : 1));
            let trophies = [
                {
                    name: boastItem.name,
                    quantity: -1 * boastQuantity,
                    value: 0
                }
            ];
            const results: HeroModification[] = [
                {
                    type: HeroModificationType.REMOVE,
                    attributeName: 'trophies',
                    data: trophies,
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'renown',
                    data: renownValue,
                },
            ]
            
            const newTask = {
                description: 'Boasting of ' + makeStringIndefinite(boastItem.name, boastQuantity),
                durationMs: 1000,
                results: results,
            }
            return newTask;
        } else {
            const newTask = {
                description: 'Cleanup',
                durationMs: 10,
                results: [
                    {
                        type: HeroModificationType.SET,
                        attributeName: 'isInTrophyBoastingMode',
                        data: false,
                    },
                ],
            }
            return newTask;
        }
    }
};

const endBoastingTaskGen: TaskGenerator = {
    priority: 4,
    shouldRun: (state: AppState) => {
        if (state.activeTaskMode !== TaskMode.GLADIATING || !state.hero.isInTrophyBoastingMode) {
            return false;
        }

        const currentEquipmentIntegrity = state.hero.trophies.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEquipmentIntegrity <= 0;
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: 'Heading off in search of glory',
            durationMs: 4 * 1000,
            results: [
                {
                    type: HeroModificationType.SET,
                    attributeName: 'isInTrophyBoastingMode',
                    data: false,
                }
            ]
        }

        return newTask;
    }
};

const earnAccoladeTaskGen: TaskGenerator = {
    priority: 5,
    shouldRun: (state: AppState) => {
        if (state.activeTaskMode !== TaskMode.GLADIATING || !state.hero.isInTrophyBoastingMode) {
            return false;
        }

        const currentEquipmentIntegrity = state.hero.trophies.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEquipmentIntegrity <= 0 && (state.hero.renown - state.hero.spentRenown) >= getTradeInCostForLevel(state.hero.level);
    },
    generateTask: (state: AppState) => {
        const newAccoladeMod = generateNewAccoladeModification(state.hero);
        const newTask: Task = {
            description: 'Being honored for your glorious achievements',
            durationMs: 5 * 1000,
            results: [
                newAccoladeMod,
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'spentRenown',
                    data: getTradeInCostForLevel(state.hero.level),
                },
            ]
        }
        return newTask;
    },
};

const investigatingTaskGen: TaskGenerator = {
    priority: 1,
    shouldRun: (state: AppState) => {
        return state.activeTaskMode == TaskMode.INVESTIGATING;
    },
    generateTask: (/*state: AppState*/) => {
        const {taskName, leadData} = generateInvestigatingTaskContents();
        const durationSeconds = 1;

        const results: HeroModification[] = [
            {
                type: HeroModificationType.ADD,
                attributeName: 'leads',
                data: leadData,
            },
        ]
        
        const newTask = {
            description: taskName,
            durationMs: durationSeconds * 1000,
            results: results
        };
        return newTask;
    }
};

const triggerLeadFollowingTaskGen: TaskGenerator = {
    priority: 2,
    shouldRun: (state: AppState) => {
        if (state.activeTaskMode !== TaskMode.INVESTIGATING) {
            return false;
        }

        return state.hero.leads.length >= state.hero.maxQuestLogSize;
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: 'Organizing your Questlog',
            durationMs: 4 * 1000,
            results: [
                {
                    type: HeroModificationType.SET,
                    attributeName: 'isInLeadFollowingMode',
                    data: true,
                }
            ]
        }

        return newTask;
    }
};

const leadFollowingTaskGen: TaskGenerator = {
    priority: 3,
    shouldRun: (state: AppState) => {
        return state.activeTaskMode === TaskMode.INVESTIGATING && state.hero.isInLeadFollowingMode;
    },
    generateTask: (state: AppState) => {
        const leadToFollow = state.hero.leads[0];
        if (!!leadToFollow) {
            const isOverexposed = state.hero.socialExposure >= state.hero.maxSocialCapital;
            const reputationValue = Math.ceil((leadToFollow.value * state.hero.level) / (isOverexposed ? 2 : 1));
            const durationSeconds = randRange(5, 8);
            const results: HeroModification[] = [
                {
                    type: HeroModificationType.REMOVE,
                    attributeName: 'leads',
                    data: [leadToFollow],
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'reputation',
                    data: reputationValue,
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'socialExposure',
                    data: 1,
                },
                {
                    type: HeroModificationType.DECREASE,
                    attributeName: 'marketSaturation',
                    data: -2,
                },
                {
                    type: HeroModificationType.DECREASE,
                    attributeName: 'fatigue',
                    data: -2,
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'currentXp',
                    data: (Math.ceil(durationSeconds / (isOverexposed ? 2 : 1))),
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'adventureProgress',
                    data: (Math.ceil(durationSeconds / (isOverexposed ? 2 : 1))),
                },
            ]
            
            const newTask = {
                description: leadToFollow.taskName,
                durationMs: durationSeconds * 1000,
                results: results,
            }
            return newTask;
        } else {
            const newTask = {
                description: 'Cleanup',
                durationMs: 10,
                results: [
                    {
                        type: HeroModificationType.SET,
                        attributeName: 'isInLeadFollowingMode',
                        data: false,
                    },
                ],
            }
            return newTask;
        }
    }
};

const endLeadFollowingTaskGen: TaskGenerator = {
    priority: 4,
    shouldRun: (state: AppState) => {
        if (state.activeTaskMode !== TaskMode.INVESTIGATING || !state.hero.isInLeadFollowingMode) {
            return false;
        }

        return state.hero.leads.length <= 0;
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: `Rooting out some ${randFromList(LEAD_GATHERING_TASK_MODIFIERS)} leads`,
            durationMs: 4 * 1000,
            results: [
                {
                    type: HeroModificationType.SET,
                    attributeName: 'isInLeadFollowingMode',
                    data: false,
                }
            ]
        }

        return newTask;
    }
};

const gainAffiliationTaskGen: TaskGenerator = {
    priority: 5,
    shouldRun: (state: AppState) => {
        if (state.activeTaskMode !== TaskMode.INVESTIGATING || !state.hero.isInLeadFollowingMode) {
            return false;
        }

        return state.hero.leads.length <= 0 && (state.hero.reputation - state.hero.spentReputation) >= getTradeInCostForLevel(state.hero.level);
    },
    generateTask: (state: AppState) => {
        const newAffiliationMod = generateNewAffiliationModification(state.hero);
        const newTask: Task = {
            description: 'Solidifying a new connection',
            durationMs: 5 * 1000,
            results: [
                newAffiliationMod,
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'spentReputation',
                    data: getTradeInCostForLevel(state.hero.level),
                },
            ]
        }
        return newTask;
    },
};

let prologueInc = 0;
const prologueTaskGen: TaskGenerator = {
    priority: 6,
    shouldRun: (state: AppState) => {
        return state.hero.currentAdventure.name == PROLOGUE_ADVENTURE_NAME;
    },
    generateTask: (/*state: AppState*/) => {
        const curPrologueTask = PROLOGUE_TASKS[prologueInc];
        prologueInc += 1;
        prologueInc = Math.min(prologueInc, PROLOGUE_TASKS.length-1);
        const newTask: Task = {
            description: curPrologueTask.taskDescription,
            durationMs: curPrologueTask.durationSeconds * 1000,
            results: [
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'adventureProgress',
                    data: curPrologueTask.durationSeconds,
                },
            ],
        };
        return newTask;
    },
}

const prologueTransitionTaskGen: TaskGenerator = {
    priority: 7,
    shouldRun: (state: AppState) => {
        return (state.hero.currentAdventure.name == PROLOGUE_ADVENTURE_NAME && state.hero.adventureProgress >= state.hero.currentAdventure.progressRequired);
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: 'Loading',
            durationMs: 20,
            results: [
                {
                    type: HeroModificationType.SET,
                    attributeName: 'currentAdventure',
                    data: {
                        name: 'Chapter 1',
                        progressRequired: 40,
                    },
                },
                {
                    type: HeroModificationType.SET,
                    attributeName: 'adventureProgress',
                    data: 0,
                },
                {
                    type: HeroModificationType.ADD,
                    attributeName: 'completedAdventures',
                    data: [PROLOGUE_ADVENTURE_NAME],
                },
            ],
        };
        return newTask;
    }
}


const adventureTransitionTaskGen: TaskGenerator = {
    priority: 6,
    shouldRun: (state: AppState) => {
        return (state.hero.adventureProgress >= state.hero.currentAdventure.progressRequired);
    },
    generateTask: (state: AppState) => {
        const newAdventure = generateNextAdventureName(state.hero.currentAdventure);
        const completionReward = randRange(0, 1) ? generateNewEquipmentModification(state.hero) : generateSpellOrAbilityModification(state.hero);
        const newTask: Task = {
            description: 'Experiencing an enigmatic and foreboding night vision',
            durationMs: randRange(2, 3) * 1000,
            results: [
                {
                    type: HeroModificationType.SET,
                    attributeName: 'currentAdventure',
                    data: newAdventure,
                },
                {
                    type: HeroModificationType.SET,
                    attributeName: 'adventureProgress',
                    data: 0,
                },
                {
                    type: HeroModificationType.ADD,
                    attributeName: 'completedAdventures',
                    data: [state.hero.currentAdventure.name],
                },
                completionReward,
            ],
        };
        return newTask;
    }
};

export const PRIORITIZED_TASK_GENERATORS = [
    lootingTaskGen,
    triggerSelloffTaskGen,
    selloffTaskGen,
    endSelloffTaskGen,
    purchaseEquipmentTaskGen,
    gladiatingTaskGen,
    triggerBoastingTaskGen,
    boastingTaskGen,
    endBoastingTaskGen,
    earnAccoladeTaskGen,
    investigatingTaskGen,
    triggerLeadFollowingTaskGen,
    leadFollowingTaskGen,
    endLeadFollowingTaskGen,
    gainAffiliationTaskGen,
    prologueTaskGen,
    prologueTransitionTaskGen,
    adventureTransitionTaskGen,
].sort((a, b) => {
    return b.priority - a.priority;
});