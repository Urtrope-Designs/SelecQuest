import { Event, EventEmitter, Component, Prop } from '@stencil/core';
import { Observable } from 'rxjs/Observable';

import { Task, CharacterModification, CharacterModificationType, AppState, TaskMode } from './models';
import { SetActiveTask, TaskCompleted } from './actions';
import { randRange, makeStringIndefinite, randFromList } from './utils';
import { PROLOGUE_TASKS, PROLOGUE_ADVENTURE_NAME, generateNextAdventureName } from './storyline-helpers';
import { generateLootingTaskContentsFromLevel, generateGladiatingTaskContentsFromLevel, generateInvestigatingTaskContents, getTradeInCostForLevel } from './task-helper';
import { LEAD_GATHERING_TASK_MODIFIERS } from '../global/config';
import { generateNewEquipmentModification, generateSpellOrAbilityModification, generateNewAccoladeModification, generateNewAffiliationModification } from './character-manager';

@Component({
    tag: 'task-manager',
})
export class TaskManager {
    private taskGenAlgos: TaskGenerator[];
    @Prop() stateStore: Observable<AppState>;
    @Event() taskAction: EventEmitter;

    constructor() {
        this.taskGenAlgos = [
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
        ];
        this.taskGenAlgos.sort((a, b) => {
            return b.priority - a.priority;
        })
       
    }

    componentWillLoad() {
        this.stateStore.subscribe((state: AppState) => {
            if (!state.hasActiveTask) {
                const curAlgo = this.taskGenAlgos.find((algo: TaskGenerator) => {
                    return algo.shouldRun(state);
                })
                let newTask = curAlgo.generateTask(state);
        
                setTimeout(() => {
                    newTask.completionTimeoutId = setTimeout(this.completeTask.bind(this), newTask.durationMs, newTask);
                    this.taskAction.emit(new SetActiveTask(newTask));
                }, 10)
            }
        })
    }

    private completeTask(completedTask: Task) {
        this.taskAction.emit(new TaskCompleted(completedTask));
    }
}

interface TaskGenerator {
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
        const {taskName, taskLevel, lootData} = generateLootingTaskContentsFromLevel(state.character.level);
        const durationSeconds = Math.floor(6 * taskLevel / state.character.level);
        const isMarketSaturated = state.character.marketSaturation >= state.character.maxMarketSaturation;
        const results: CharacterModification[] = [
            {
                type: CharacterModificationType.ADD_QUANTITY,
                attributeName: 'loot',
                data: lootData,
            },
            {
                type: CharacterModificationType.DECREASE,
                attributeName: 'fatigue',
                data: -2,
            },
            {
                type: CharacterModificationType.DECREASE,
                attributeName: 'socialExposure',
                data: -2,
            },
            {
                type: CharacterModificationType.INCREASE,
                attributeName: 'currentXp',
                data: (Math.ceil(durationSeconds / (isMarketSaturated ? 2 : 1))),
            },
            {
                type: CharacterModificationType.INCREASE,
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

        const currentEncumbrance = state.character.loot.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEncumbrance >= state.character.maxEncumbrance;
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: 'Heading to market to pawn your loot',
            durationMs: 4 * 1000,
            results: [
                {
                    type: CharacterModificationType.SET,
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
        return state.activeTaskMode == TaskMode.LOOTING && state.character.isInLootSelloffMode;
    },
    generateTask: (state: AppState) => {
        const sellItem = state.character.loot[0];
        if (!!sellItem) {
            const isMarketSaturated = state.character.marketSaturation >= state.character.maxMarketSaturation;
            const sellQuantity = sellItem.quantity;
            const sellValue = Math.ceil((sellQuantity * sellItem.value * state.character.level) / (isMarketSaturated ? 2 : 1));
            let lootData = [
                {
                    name: sellItem.name,
                    quantity: -1 * sellQuantity,
                    value: 0
                }
            ];
            const results: CharacterModification[] = [
                {
                    type: CharacterModificationType.REMOVE,
                    attributeName: 'loot',
                    data: lootData,
                },
                {
                    type: CharacterModificationType.INCREASE,
                    attributeName: 'gold',
                    data: sellValue,
                },
                {
                    type: CharacterModificationType.INCREASE,
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
                        type: CharacterModificationType.SET,
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
        if (state.activeTaskMode !== TaskMode.LOOTING || !state.character.isInLootSelloffMode) {
            return false;
        }

        const currentEncumbrance = state.character.loot.reduce((prevVal, curVal) => {
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
                    type: CharacterModificationType.SET,
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
        if (state.activeTaskMode !== TaskMode.LOOTING || !state.character.isInLootSelloffMode) {
            return false;
        }

        const currentEncumbrance = state.character.loot.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        const minGold = getTradeInCostForLevel(state.character.level);
        return currentEncumbrance <= 0 && state.character.gold >= minGold;
    },
    generateTask: (state: AppState) => {
        const newEquipmentMod = generateNewEquipmentModification(state.character);
        const newTask: Task = {
            description: 'Negotiating the purchase of better equipment',
            durationMs: 5 * 1000,
            results: [
                newEquipmentMod,
                {
                    type: CharacterModificationType.DECREASE,
                    attributeName: 'gold',
                    data: -getTradeInCostForLevel(state.character.level),
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
        const {taskName, taskLevel, trophyData} = generateGladiatingTaskContentsFromLevel(state.character.level);
        const durationSeconds = Math.floor(6 * taskLevel / state.character.level);
        const isFatigued = state.character.fatigue >= state.character.maxFatigue;
        const results: CharacterModification[] = [
            {
                type: CharacterModificationType.ADD_QUANTITY,
                attributeName: 'trophies',
                data: trophyData,
            },
            {
                type: CharacterModificationType.DECREASE,
                attributeName: 'marketSaturation',
                data: -2,
            },
            {
                type: CharacterModificationType.DECREASE,
                attributeName: 'socialExposure',
                data: -2,
            },
            {
                type: CharacterModificationType.INCREASE,
                attributeName: 'currentXp',
                data: (Math.ceil(durationSeconds / (isFatigued ? 2 : 1))),
            },
            {
                type: CharacterModificationType.INCREASE,
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

        const currentEquipmentWear = state.character.trophies.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEquipmentWear >= state.character.maxEquipmentWear;
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: 'Heading to the nearest inn to boast of your recent deeds while your armor is repaired',
            durationMs: 4 * 1000,
            results: [
                {
                    type: CharacterModificationType.SET,
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
        return state.activeTaskMode === TaskMode.GLADIATING && state.character.isInTrophyBoastingMode;
    },
    generateTask: (state: AppState) => {
        const boastItem = state.character.trophies[0];
        if (!!boastItem) {
            const isFatigued = state.character.fatigue >= state.character.maxFatigue;
            const boastQuantity = boastItem.quantity;
            const renownValue = Math.ceil((boastQuantity * boastItem.value * state.character.level) / (isFatigued ? 2 : 1));
            let trophies = [
                {
                    name: boastItem.name,
                    quantity: -1 * boastQuantity,
                    value: 0
                }
            ];
            const results: CharacterModification[] = [
                {
                    type: CharacterModificationType.REMOVE,
                    attributeName: 'trophies',
                    data: trophies,
                },
                {
                    type: CharacterModificationType.INCREASE,
                    attributeName: 'renown',
                    data: renownValue,
                },
                {
                    type: CharacterModificationType.INCREASE,
                    attributeName: 'fatigue',
                    data: boastQuantity,
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
                        type: CharacterModificationType.SET,
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
        if (state.activeTaskMode !== TaskMode.GLADIATING || !state.character.isInTrophyBoastingMode) {
            return false;
        }

        const currentEquipmentIntegrity = state.character.trophies.reduce((prevVal, curVal) => {
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
                    type: CharacterModificationType.SET,
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
        if (state.activeTaskMode !== TaskMode.GLADIATING || !state.character.isInTrophyBoastingMode) {
            return false;
        }

        const currentEquipmentIntegrity = state.character.trophies.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEquipmentIntegrity <= 0 && (state.character.renown - state.character.spentRenown) >= getTradeInCostForLevel(state.character.level);
    },
    generateTask: (state: AppState) => {
        const newAccoladeMod = generateNewAccoladeModification(state.character);
        const newTask: Task = {
            description: 'Being honored for your glorious achievements',
            durationMs: 5 * 1000,
            results: [
                newAccoladeMod,
                {
                    type: CharacterModificationType.INCREASE,
                    attributeName: 'spentRenown',
                    data: getTradeInCostForLevel(state.character.level),
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

        const results: CharacterModification[] = [
            {
                type: CharacterModificationType.ADD,
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

        return state.character.leads.length >= state.character.maxQuestLogSize;
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: 'Organizing your Questlog',
            durationMs: 4 * 1000,
            results: [
                {
                    type: CharacterModificationType.SET,
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
        return state.activeTaskMode === TaskMode.INVESTIGATING && state.character.isInLeadFollowingMode;
    },
    generateTask: (state: AppState) => {
        const leadToFollow = state.character.leads[0];
        if (!!leadToFollow) {
            const isOverexposed = state.character.socialExposure >= state.character.maxSocialCapital;
            const reputationValue = Math.ceil((leadToFollow.value * state.character.level) / (isOverexposed ? 2 : 1));
            const durationSeconds = randRange(5, 8);
            const results: CharacterModification[] = [
                {
                    type: CharacterModificationType.REMOVE,
                    attributeName: 'leads',
                    data: [leadToFollow],
                },
                {
                    type: CharacterModificationType.INCREASE,
                    attributeName: 'reputation',
                    data: reputationValue,
                },
                {
                    type: CharacterModificationType.INCREASE,
                    attributeName: 'socialExposure',
                    data: 1,
                },
                {
                    type: CharacterModificationType.DECREASE,
                    attributeName: 'marketSaturation',
                    data: -2,
                },
                {
                    type: CharacterModificationType.DECREASE,
                    attributeName: 'fatigue',
                    data: -2,
                },
                {
                    type: CharacterModificationType.INCREASE,
                    attributeName: 'currentXp',
                    data: (Math.ceil(durationSeconds / (isOverexposed ? 2 : 1))),
                },
                {
                    type: CharacterModificationType.INCREASE,
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
                        type: CharacterModificationType.SET,
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
        if (state.activeTaskMode !== TaskMode.INVESTIGATING || !state.character.isInLeadFollowingMode) {
            return false;
        }

        return state.character.leads.length <= 0;
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: `Rooting out some ${randFromList(LEAD_GATHERING_TASK_MODIFIERS)} leads`,
            durationMs: 4 * 1000,
            results: [
                {
                    type: CharacterModificationType.SET,
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
        if (state.activeTaskMode !== TaskMode.INVESTIGATING || !state.character.isInLeadFollowingMode) {
            return false;
        }

        return state.character.leads.length <= 0 && (state.character.reputation - state.character.spentReputation) >= getTradeInCostForLevel(state.character.level);
    },
    generateTask: (state: AppState) => {
        const newAffiliationMod = generateNewAffiliationModification(state.character);
        const newTask: Task = {
            description: 'Solidifying a new connection',
            durationMs: 5 * 1000,
            results: [
                newAffiliationMod,
                {
                    type: CharacterModificationType.INCREASE,
                    attributeName: 'spentReputation',
                    data: getTradeInCostForLevel(state.character.level),
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
        return state.character.currentAdventure.name == PROLOGUE_ADVENTURE_NAME;
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
                    type: CharacterModificationType.INCREASE,
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
        return (state.character.currentAdventure.name == PROLOGUE_ADVENTURE_NAME && state.character.adventureProgress >= state.character.currentAdventure.progressRequired);
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: 'Loading',
            durationMs: 20,
            results: [
                {
                    type: CharacterModificationType.SET,
                    attributeName: 'currentAdventure',
                    data: {
                        name: 'Chapter 1',
                        progressRequired: 40,
                    },
                },
                {
                    type: CharacterModificationType.SET,
                    attributeName: 'adventureProgress',
                    data: 0,
                },
                {
                    type: CharacterModificationType.ADD,
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
        return (state.character.adventureProgress >= state.character.currentAdventure.progressRequired);
    },
    generateTask: (state: AppState) => {
        const newAdventure = generateNextAdventureName(state.character.currentAdventure);
        const completionReward = randRange(0, 1) ? generateNewEquipmentModification(state.character) : generateSpellOrAbilityModification(state.character);
        const newTask: Task = {
            description: 'Experiencing an enigmatic and foreboding night vision',
            durationMs: randRange(2, 3) * 1000,
            results: [
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
                    data: [state.character.currentAdventure.name],
                },
                completionReward,
            ],
        };
        return newTask;
    }
};
