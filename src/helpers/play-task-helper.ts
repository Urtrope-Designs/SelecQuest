import { HeroLoot, HeroTrophy, LootingTarget, GladiatingTarget, TaskTargetType, HeroLead, LeadType, LeadTarget, HeroModification, HeroModificationType, TaskMode, AppState, Task } from "../models/models";
import { randRange, randSign, randFromList, makeStringIndefinite, generateRandomName, makeVerbGerund, capitalizeInitial } from "./utils";
import { TASK_PREFIX_MINIMAL, TASK_PREFIX_BAD_FIRST, TASK_PREFIX_BAD_SECOND, TASK_PREFIX_MAXIMAL, TASK_PREFIX_GOOD_FIRST, TASK_PREFIX_GOOD_SECOND, TASK_GERUNDS, STANDARD_GLADIATING_TARGETS, STANDARD_LOOTING_TARGETS, RACES, CLASSES, STANDARD_LEAD_GATHERING_TARGETS, STANDARD_LEAD_TARGETS, IS_DEBUG, LEAD_GATHERING_TASK_MODIFIERS } from "../global/config";
import { PROLOGUE_TASKS, PROLOGUE_ADVENTURE_NAME, generateNewAdventureResults } from './storyline-helpers';
import { generateNewEquipmentModification, generateNewAccoladeModification, generateNewAffiliationModification } from './hero-manager';
import { GameSetting } from "./game-setting";
import { GameTaskGeneratorList, TaskGenerator } from "../models/task-models";

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

function randomizeTargetLevel(heroLevel: number): number {
    let targetLevel = heroLevel;
    for (let i = heroLevel; i >= 1; --i) {
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
export function generateLootingTaskContentsFromLevel(level: number): {taskName: string, taskLevel: number, lootData: HeroLoot[]} {
    let taskName = '';
    let lootData: HeroLoot[] = [];

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

export function generateGladiatingTaskContentsFromLevel(level: number): {taskName: string, taskLevel: number, trophyData: HeroTrophy[]} {
    let taskName = '';
    let trophyData: HeroTrophy[] = [];

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

export function generateInvestigatingTaskContents(): {taskName: string, leadData: HeroLead[]} {
    let investigatingTaskName = '';
    let leadData = [];

    const investigatingTarget = randFromList(STANDARD_LEAD_GATHERING_TARGETS);

    investigatingTaskName = capitalizeInitial(`${investigatingTarget.gerundPhrase} ${randFromList(investigatingTarget.predicateOptions)}`);

    const leadTargetType: LeadType = randFromList(investigatingTarget.leadTypes);
    const leadTarget: LeadTarget = randFromList(STANDARD_LEAD_TARGETS[leadTargetType]);

    const leadPredicate = leadTarget.predicateFactory.apply(null);
    const lead: HeroLead = {
        questlogName: capitalizeInitial(`${leadTarget.verb} ${leadPredicate}`),
        taskName: capitalizeInitial(`${makeVerbGerund(leadTarget.verb)} ${leadPredicate}`),
        value: 1,
    }

    leadData.push(lead);

    return {taskName: investigatingTaskName, leadData: leadData};
}

export function getTradeInCostForLevel(level: number): number {
    return IS_DEBUG ? (10 * level + 4) : (5 * level**2 + 10 * level + 20);
}

const lootingTaskGen: TaskGenerator = {
    shouldRun: (_state: AppState) => {
        return true;
    },
    generateTask: (state: AppState, _gameSetting: GameSetting) => {
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
    shouldRun: (state: AppState) => {
        if (state.activeTaskMode !== TaskMode.LOOTING) {
            return false;
        }

        const currentEncumbrance = state.hero.loot.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEncumbrance >= state.hero.maxEncumbrance;
    },
    generateTask: (_state: AppState, _gameSetting: GameSetting) => {
        const newTask: Task = {
            description: 'Heading to market to pawn your loot',
            durationMs: 4 * 1000,
            results: [
                {
                    type: HeroModificationType.SET_TEARDOWN_MODE,
                    attributeName: 'isInTeardownMode',
                    data: [{index: TaskMode.LOOTING, value: true}],
                }
            ]
        }

        return newTask;
    }
};

const selloffTaskGen: TaskGenerator = {
    shouldRun: (_state: AppState) => {
        return true;
    },
    generateTask: (state: AppState, _gameSetting: GameSetting) => {
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
                        type: HeroModificationType.SET_TEARDOWN_MODE,
                        attributeName: 'isInTeardownMode',
                        data: [{index: TaskMode.LOOTING, value: false}],
                    }
                ],
            }
            return newTask;
        }
    }
};

const endSelloffTaskGen: TaskGenerator = {
    shouldRun: (state: AppState) => {
        const currentEncumbrance = state.hero.loot.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEncumbrance <= 0;
    },
    generateTask: (_state: AppState, _gameSetting: GameSetting) => {
        const newTask: Task = {
            description: 'Heading out to find some swag',
            durationMs: 4 * 1000,
            results: [
                {
                    type: HeroModificationType.SET_TEARDOWN_MODE,
                    attributeName: 'isInTeardownMode',
                    data: [{index: TaskMode.LOOTING, value: false}],
                }
            ]
        }

        return newTask;
    },
};

const purchaseEquipmentTaskGen: TaskGenerator = {
    shouldRun: (state: AppState) => {
        const currentEncumbrance = state.hero.loot.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        const minGold = getTradeInCostForLevel(state.hero.level);
        return currentEncumbrance <= 0 && state.hero.gold >= minGold;
    },
    generateTask: (state: AppState, _gameSetting: GameSetting) => {
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
    shouldRun: (_state: AppState) => {
        return true;
    },
    generateTask: (state: AppState, _gameSetting: GameSetting) => {
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
    shouldRun: (state: AppState) => {
        if (state.activeTaskMode !== TaskMode.GLADIATING) {
            return false;
        }

        const currentEquipmentWear = state.hero.trophies.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEquipmentWear >= state.hero.maxEquipmentWear;
    },
    generateTask: (_state: AppState, _gameSetting: GameSetting) => {
        const newTask: Task = {
            description: 'Heading to the nearest inn to boast of your recent deeds while your armor is repaired',
            durationMs: 4 * 1000,
            results: [
                {
                    type: HeroModificationType.SET_TEARDOWN_MODE,
                    attributeName: 'isInTeardownMode',
                    data: [{index: TaskMode.GLADIATING, value: true}],
                }
            ]
        }

        return newTask;
    }
};

const boastingTaskGen: TaskGenerator = {
    shouldRun: (_state: AppState) => {
        return true;
    },
    generateTask: (state: AppState, _gameSetting: GameSetting) => {
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
                        type: HeroModificationType.SET_TEARDOWN_MODE,
                        attributeName: 'isInTeardownMode',
                        data: [{index: TaskMode.GLADIATING, value: false}],
                    },
                ],
            }
            return newTask;
        }
    }
};

const endBoastingTaskGen: TaskGenerator = {
    shouldRun: (state: AppState) => {
        const currentEquipmentIntegrity = state.hero.trophies.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEquipmentIntegrity <= 0;
    },
    generateTask: (_state: AppState, _gameSetting: GameSetting) => {
        const newTask: Task = {
            description: 'Heading off in search of glory',
            durationMs: 4 * 1000,
            results: [
                {
                    type: HeroModificationType.SET_TEARDOWN_MODE,
                    attributeName: 'isInTeardownMode',
                    data: [{index: TaskMode.GLADIATING, value: false}],
                }
            ]
        }

        return newTask;
    }
};

const earnAccoladeTaskGen: TaskGenerator = {
    shouldRun: (state: AppState) => {
        const currentEquipmentIntegrity = state.hero.trophies.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEquipmentIntegrity <= 0 && (state.hero.renown - state.hero.spentRenown) >= getTradeInCostForLevel(state.hero.level);
    },
    generateTask: (state: AppState, _gameSetting: GameSetting) => {
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
    shouldRun: (_state: AppState) => {
        return true;
    },
    generateTask: (_state: AppState, _gameSetting: GameSetting) => {
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
    shouldRun: (state: AppState) => {
        if (state.activeTaskMode !== TaskMode.INVESTIGATING) {
            return false;
        }

        return state.hero.leads.length >= state.hero.maxQuestLogSize;
    },
    generateTask: (_state: AppState, _gameSetting: GameSetting) => {
        const newTask: Task = {
            description: 'Organizing your Questlog',
            durationMs: 4 * 1000,
            results: [
                {
                    type: HeroModificationType.SET_TEARDOWN_MODE,
                    attributeName: 'isInTeardownMode',
                    data: [{index: TaskMode.INVESTIGATING, value: true}],
                }
            ]
        }

        return newTask;
    }
};

const leadFollowingTaskGen: TaskGenerator = {
    shouldRun: (_state: AppState) => {
        return true;
    },
    generateTask: (state: AppState, _gameSetting: GameSetting) => {
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
                        type: HeroModificationType.SET_TEARDOWN_MODE,
                        attributeName: 'isInTeardownMode',
                        data: [{index: TaskMode.INVESTIGATING, value: false}],
                    },
                ],
            }
            return newTask;
        }
    }
};

const endLeadFollowingTaskGen: TaskGenerator = {
    shouldRun: (state: AppState) => {
        return state.hero.leads.length <= 0;
    },
    generateTask: (_state: AppState, _gameSetting: GameSetting) => {
        const newTask: Task = {
            description: `Rooting out some ${randFromList(LEAD_GATHERING_TASK_MODIFIERS)} leads`,
            durationMs: 4 * 1000,
            results: [
                {
                    type: HeroModificationType.SET_TEARDOWN_MODE,
                    attributeName: 'isInTeardownMode',
                    data: [{index: TaskMode.INVESTIGATING, value: false}],
                }
            ]
        }

        return newTask;
    }
};

const gainAffiliationTaskGen: TaskGenerator = {
    shouldRun: (state: AppState) => {
        return state.hero.leads.length <= 0 && (state.hero.reputation - state.hero.spentReputation) >= getTradeInCostForLevel(state.hero.level);
    },
    generateTask: (state: AppState, _gameSetting: GameSetting) => {
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
    shouldRun: (state: AppState) => {
        return state.hero.currentAdventure.name == PROLOGUE_ADVENTURE_NAME;
    },
    generateTask: (_state: AppState, _gameSetting: GameSetting) => {
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
    shouldRun: (state: AppState) => {
        return (state.hero.currentAdventure.name == PROLOGUE_ADVENTURE_NAME && state.hero.adventureProgress >= state.hero.currentAdventure.progressRequired);
    },
    generateTask: (state: AppState, _gameSetting: GameSetting) => {
        const newTask: Task = {
            description: 'Loading',
            durationMs: 20,
            results: generateNewAdventureResults(state.hero, false),
        };
        return newTask;
    }
}


const adventureTransitionTaskGen: TaskGenerator = {
    shouldRun: (state: AppState) => {
        return (state.hero.adventureProgress >= state.hero.currentAdventure.progressRequired);
    },
    generateTask: (state: AppState, _gameSetting: GameSetting) => {
        const newTask: Task = {
            description: 'Experiencing an enigmatic and foreboding night vision',
            durationMs: randRange(2, 3) * 1000,
            results: generateNewAdventureResults(state.hero),
        };
        return newTask;
    }
};

const PRIORITIZED_TASK_GENERATORS: GameTaskGeneratorList = {
    coreTaskGenerators: [
        prologueTransitionTaskGen,
        prologueTaskGen,
        adventureTransitionTaskGen,
    ],
    adventuringModeTaskGenerators: [
        [           // Adventuring Mode 0
            [       // teardownMode[0] == false
                triggerSelloffTaskGen,
                lootingTaskGen,
            ],
            [       // teardownMode[0] == true
                purchaseEquipmentTaskGen,
                endSelloffTaskGen,
                selloffTaskGen,
            ],
        ],
        [           // Adventuring Mode 1
            [       // teardownMode[1] == false
                triggerBoastingTaskGen,
                gladiatingTaskGen,
            ],
            [       // teardownMode[1] == true
                earnAccoladeTaskGen,
                endBoastingTaskGen,
                boastingTaskGen,
            ],
        ],
        [           // Adventuring Mode 2
            [       // teardownMode[2] == false
                triggerLeadFollowingTaskGen,
                investigatingTaskGen,
            ],
            [       // teardownMode[2] == true
                gainAffiliationTaskGen,
                endLeadFollowingTaskGen,
                leadFollowingTaskGen,
            ]
        ]
    ]
}

export function selectNextTaskGenerator(state: AppState): TaskGenerator {
    let nextTaskGenerator: TaskGenerator;
    nextTaskGenerator = PRIORITIZED_TASK_GENERATORS.coreTaskGenerators.find(taskGen => taskGen.shouldRun(state));

    if (!nextTaskGenerator) {
        const taskGeneratorsForState = PRIORITIZED_TASK_GENERATORS.adventuringModeTaskGenerators[state.activeTaskMode][+state.hero.isInTeardownMode[state.activeTaskMode]];
        nextTaskGenerator = taskGeneratorsForState.find(taskGen => taskGen.shouldRun(state));
    }

    return nextTaskGenerator;
}