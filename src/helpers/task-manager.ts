import { Event, EventEmitter, Component, Prop } from '@stencil/core';
import { Observable } from 'rxjs/Observable';

import { Task, AppState } from './models';
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

let taskInc = 1;

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
            description: 'Do loot task ' + taskInc++,
            durationMs: randRange(5, 8) * 1000,
            results: results
        };
        return newTask;
    },
}

const selloffTaskGenerator: TaskGenerator = {
    priority: 1,
    shouldRun: (state: AppState) => {
        const currentEncumbrance = Object.keys(state.character.loot).reduce((prevVal, curVal) => {
            return prevVal + state.character.loot[curVal].quantity;
        }, 0)
        
        return currentEncumbrance >= state.character.maxEncumbrance;
    },
    generateTask: (state: AppState) => {
        const sellName = Object.keys(state.character.loot)[0];
        const sellQuantity = state.character.loot[sellName].quantity;
        const sellValue = state.character.loot[sellName].value * sellQuantity;
        let loot = {};
        loot[sellName] = {
            quantity: -1 * sellQuantity,
            value: 0
        };
        const results = {
            'loot': loot,
            'gold': sellValue,
        }
        const newTask = {
            description: 'Sell ' + sellName,
            durationMs: randRange(3,5) * 1000,
            results: results,
        }
        return newTask;
    }
}