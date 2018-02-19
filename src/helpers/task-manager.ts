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
    shouldRun: (state: AppState) => {
        return true;
    },
    generateTask: (state: AppState) => {
        const lootName = 'loot' + randRange(1, 4);
        let loot = {};
        loot[lootName] = {
            quantity: 1,
            value: 1
        }
        const results = {
            'loot': loot
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
        return state.activeTaskMode == TaskMode.LOOTING && state.character.isInLootSelloff;
    },
    generateTask: (state: AppState) => {
        const sellName = Object.keys(state.character.loot)[0];
        console.log('sellName: ' + sellName);
        if (!!sellName) {
            const sellQuantity = !!state.character.loot && state.character.loot[sellName].quantity;
            const sellValue = state.character.loot[sellName].value * sellQuantity;
            let loot = {};
            loot[sellName] = {
                quantity: -1 * sellQuantity,
                value: 0
            };
            const results = {
                'loot': loot,
                'gold': sellValue,
                'isInLootSelloff': (Object.keys(state.character.loot).length <= 0) ? false : state.character.isInLootSelloff,
            }

            const newTask = {
                description: 'Sell ' + sellName,
                durationMs: randRange(2,3) * 1000,
                results: results,
            }
            return newTask;
        } else {
            const newTask = {
                description: 'Cleanup',
                durationMs: 10,
                results: {'isInLootSelloff': false},
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
    generateTask: (state: AppState) => {
        const trophyName = 'trophy' + randRange(1, 4);
        let trophy = {};
        trophy[trophyName] = {
            quantity: 1,
            value: 1
        }
        const results = {
            'trophy': trophy
        }
        const newTask = {
            description: 'Do gladiating task ' + gTaskInc++,
            durationMs: randRange(5, 8) * 1000,
            results: results
        };
        return newTask;

    }
}