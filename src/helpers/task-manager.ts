import { Event, EventEmitter, Component, Prop } from '@stencil/core';
import { Observable } from 'rxjs/Observable';

import { Task, AppState, TaskMode } from './models';
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
            lootingTaskGenerator,
            selloffTaskGenerator,
            gladiatingTaskGenerator,
            boastingTaskGenerator,
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

const lootingTaskGenerator: TaskGenerator = {
    priority: 0,
    shouldRun: (/*state: AppState*/) => {
        return true;
    },
    generateTask: (/*state: AppState*/) => {
        const lootName = 'loot' + randRange(1, 4);
        let loot = [
            {
                name: lootName,
                quantity: 1,
                value: 2
            }
        ]
        const results = {
            'loot': loot,
            'staminaSpent': -2,
            'socialExposure': -2,
        }
        const newTask = {
            description: 'Do loot task ' + lTaskInc++,
            durationMs: randRange(3, 4) * 1000,
            results: results
        };
        return newTask;
    },
}

const selloffTaskGenerator: TaskGenerator = {
    priority: 2,
    shouldRun: (state: AppState) => {
        return state.activeTaskMode == TaskMode.LOOTING && state.character.isInLootSelloffMode;
    },
    generateTask: (state: AppState) => {
        const sellItem = state.character.loot[0];
        if (!!sellItem) {
            const isMarketSaturated = state.character.marketSaturation >= state.character.maxMarketSaturation;
            const sellQuantity = sellItem.quantity;
            const sellValue = (sellQuantity * Math.ceil(sellItem.value / (isMarketSaturated ? 2 : 1)));
            let loot = [
                {
                    name: sellItem.name,
                    quantity: -1 * sellQuantity,
                    value: 0
                }
            ];
            const results = {
                'loot': loot,
                'gold': sellValue,
                'marketSaturation': sellValue,
            }

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
                results: {'isInLootSelloffMode': false},
            }
            return newTask;
        }
    }
}

const gladiatingTaskGenerator: TaskGenerator = {
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
        const results = {
            'trophies': trophy,
            'marketSaturation': -2,
            'socialExposure': -2,
        }
        const newTask = {
            description: 'Do gladiating task ' + gTaskInc++,
            durationMs: randRange(5, 8) * 1000,
            results: results
        };
        return newTask;
    }
}

const boastingTaskGenerator: TaskGenerator = {
    priority: 2,
    shouldRun: (state: AppState) => {
        return state.activeTaskMode === TaskMode.GLADIATING && state.character.isInTrophyBoastingMode;
    },
    generateTask: (state: AppState) => {
        const boastItem = state.character.trophies[0];
        if (!!boastItem) {
            const isFatigued = state.character.staminaSpent >= state.character.maxStamina;
            const boastQuantity = boastItem.quantity;
            const renownValue = (boastQuantity * Math.ceil(boastItem.value / (isFatigued ? 2 : 1)));
            let trophies = [
                {
                    name: boastItem.name,
                    quantity: -1 * boastQuantity,
                    value: 0
                }
            ];
            const results = {
                'trophies': trophies,
                'renown': renownValue,
                'staminaSpent': renownValue,
            }

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
                results: {'isInTrophyBoastingMode': false},
            }
            return newTask;
        }
    }
}