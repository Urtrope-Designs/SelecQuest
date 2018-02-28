import { Event, EventEmitter, Component, Prop } from '@stencil/core';
import { Observable } from 'rxjs/Observable';

import { Task, TaskResult, TaskResultType, AppState, TaskMode } from './models';
import { SetActiveTask, TaskCompleted } from './actions';
import { randRange } from './utils';

@Component({
    tag: 'task-manager',
})
export class TaskManager {
    private taskGenAlgos: TaskGenerator[];
    @Prop() stateStore: Observable<AppState>;
    @Event() taskAction: EventEmitter;

    constructor() {
        this.taskGenAlgos =[
            lootingTaskGen,
            triggerSelloffTaskGen,
            selloffTaskGen,
            endSelloffTaskGen,
            gladiatingTaskGen,
            triggerBoastingTaskGen,
            boastingTaskGen,
            endBoastingTaskGen,
            investigatingTaskGen,
            triggerLeadFollowingTaskGen,
            leadFollowingTaskGen,
            endLeadFollowingTaskGen,
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

let lTaskInc = 1;
let gTaskInc = 1;
let iTaskInc = 1;

const lootingTaskGen: TaskGenerator = {
    priority: 0,
    shouldRun: (/*state: AppState*/) => {
        return true;
    },
    generateTask: (/*state: AppState*/) => {
        const lootName = 'loot' + randRange(1, 4);
        let lootData = [
            {
                name: lootName,
                quantity: 1,
                value: 2
            }
        ]
        const results: TaskResult[] = [
            {
                type: TaskResultType.ADD_QUANTITY,
                attributeName: 'loot',
                data: lootData,
            },
            {
                type: TaskResultType.DECREASE,
                attributeName: 'fatigue',
                data: -2,
            },
            {
                type: TaskResultType.DECREASE,
                attributeName: 'socialExposure',
                data: -2,
            },
        ]
        const newTask = {
            description: 'Do loot task ' + lTaskInc++,
            durationMs: randRange(3, 4) * 1000,
            results: results
        };
        return newTask;
    },
}

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
            durationMs: randRange(2,3) * 1000,
            results: [
                {
                    type: TaskResultType.SET,
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
        console.log('loot selloff');
        const sellItem = state.character.loot[0];
        if (!!sellItem) {
            const isMarketSaturated = state.character.marketSaturation >= state.character.maxMarketSaturation;
            const sellQuantity = sellItem.quantity;
            const sellValue = (sellQuantity * Math.ceil(sellItem.value / (isMarketSaturated ? 2 : 1)));
            let lootData = [
                {
                    name: sellItem.name,
                    quantity: -1 * sellQuantity,
                    value: 0
                }
            ];
            const results: TaskResult[] = [
                {
                    type: TaskResultType.REMOVE,
                    attributeName: 'loot',
                    data: lootData,
                },
                {
                    type: TaskResultType.INCREASE,
                    attributeName: 'gold',
                    data: sellValue,
                },
                {
                    type: TaskResultType.INCREASE,
                    attributeName: 'marketSaturation',
                    data: sellValue,
                },
            ]

            const newTask = {
                description: 'Sell ' + sellItem.name,
                durationMs: randRange(2,3) * 1000,
                results: results,
            }
            return newTask;
        } else {
            const newTask = {
                description: 'Cleanup',
                durationMs: 10,
                results: [
                    {
                        type: TaskResultType.SET,
                        attributeName: 'isInLootSelloffMode',
                        data: false,
                    }
                ],
            }
            return newTask;
        }
    }
}

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
            description: 'Heading out to the nearest cave',
            durationMs: randRange(2,3) * 1000,
            results: [
                {
                    type: TaskResultType.SET,
                    attributeName: 'isInLootSelloffMode',
                    data: false,
                }
            ]
        }

        return newTask;
    }
};

const gladiatingTaskGen: TaskGenerator = {
    priority: 1,
    shouldRun: (state: AppState) => {
        return state.activeTaskMode == TaskMode.GLADIATING;
    },
    generateTask: (/*state: AppState*/) => {
        const trophyName = 'trophy' + randRange(1, 4);
        let trophy = [
            {
                name: trophyName,
                quantity: 1,
                value: 2
            }
        ];
        const results: TaskResult[] = [
            {
                type: TaskResultType.ADD_QUANTITY,
                attributeName: 'trophies',
                data: trophy,
            },
            {
                type: TaskResultType.DECREASE,
                attributeName: 'marketSaturation',
                data: -2,
            },
            {
                type: TaskResultType.DECREASE,
                attributeName: 'socialExposure',
                data: -2,
            },
        ]

        const newTask = {
            description: 'Do gladiating task ' + gTaskInc++,
            durationMs: randRange(5, 8) * 1000,
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

        const currentEquipmentIntegrity = state.character.trophies.reduce((prevVal, curVal) => {
            return prevVal + curVal.quantity;
        }, 0);
        return currentEquipmentIntegrity >= state.character.maxEquipmentIntegrity;
    },
    generateTask: (/*state: AppState*/) => {
        const newTask: Task = {
            description: 'Heading to the nearest inn to boast of your recent deeds while your armor is repaired',
            durationMs: randRange(2,3) * 1000,
            results: [
                {
                    type: TaskResultType.SET,
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
            const renownValue = (boastQuantity * Math.ceil(boastItem.value / (isFatigued ? 2 : 1)));
            let trophies = [
                {
                    name: boastItem.name,
                    quantity: -1 * boastQuantity,
                    value: 0
                }
            ];
            const results: TaskResult[] = [
                {
                    type: TaskResultType.REMOVE,
                    attributeName: 'trophies',
                    data: trophies,
                },
                {
                    type: TaskResultType.INCREASE,
                    attributeName: 'renown',
                    data: renownValue,
                },
                {
                    type: TaskResultType.INCREASE,
                    attributeName: 'fatigue',
                    data: renownValue,
                },
            ]
            
            const newTask = {
                description: 'Boast of ' + boastItem.name,
                durationMs: randRange(2,3) * 1000,
                results: results,
            }
            return newTask;
        } else {
            const newTask = {
                description: 'Cleanup',
                durationMs: 10,
                results: [
                    {
                        type: TaskResultType.SET,
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
            description: 'Heading to the arena',
            durationMs: randRange(2,3) * 1000,
            results: [
                {
                    type: TaskResultType.SET,
                    attributeName: 'isInTrophyBoastingMode',
                    data: false,
                }
            ]
        }

        return newTask;
    }
};

const investigatingTaskGen: TaskGenerator = {
    priority: 1,
    shouldRun: (state: AppState) => {
        return state.activeTaskMode == TaskMode.INVESTIGATING;
    },
    generateTask: (/*state: AppState*/) => {
        const leadName = 'lead' + randRange(1, 100);
        let lead = [
            {
                name: leadName,
                value: 2
            }
        ];
        const results: TaskResult[] = [
            {
                type: TaskResultType.ADD,
                attributeName: 'leads',
                data: lead,
            },
            {
                type: TaskResultType.DECREASE,
                attributeName: 'marketSaturation',
                data: -2,
            },
            {
                type: TaskResultType.DECREASE,
                attributeName: 'fatigue',
                data: -2,
            },
        ]
        
        const newTask = {
            description: 'Do investigating task ' + iTaskInc++,
            durationMs: randRange(5, 8) * 1000,
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
            description: 'Heading out to follow up on your leads',
            durationMs: randRange(2,3) * 1000,
            results: [
                {
                    type: TaskResultType.SET,
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
            const reputationValue = (Math.ceil(leadToFollow.value / (isOverexposed ? 2 : 1)));
            let leads = [
                {
                    name: leadToFollow.name,
                    value: 0
                }
            ];
            const results: TaskResult[] = [
                {
                    type: TaskResultType.REMOVE,
                    attributeName: 'leads',
                    data: leads,
                },
                {
                    type: TaskResultType.INCREASE,
                    attributeName: 'reputation',
                    data: reputationValue,
                },
                {
                    type: TaskResultType.INCREASE,
                    attributeName: 'socialExposure',
                    data: reputationValue,
                },
            ]
            
            const newTask = {
                description: 'Follow ' + leadToFollow.name,
                durationMs: randRange(2,3) * 1000,
                results: results,
            }
            return newTask;
        } else {
            const newTask = {
                description: 'Cleanup',
                durationMs: 10,
                results: [
                    {
                        type: TaskResultType.SET,
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
            description: 'Heading to the inn to imbibe a mug o\' scuttlebutt',
            durationMs: randRange(2,3) * 1000,
            results: [
                {
                    type: TaskResultType.SET,
                    attributeName: 'isInLeadFollowingMode',
                    data: false,
                }
            ]
        }

        return newTask;
    }
};
