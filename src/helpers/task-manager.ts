import { Observable } from 'rxjs/Observable';

import { Task, AppState } from './models';
import { ActionManager, SetActiveTask, TaskCompleted } from './actions';
import { randRange } from './utils';

export class TaskManager {
    private taskGenAlgos: TaskGenerator[];

    constructor(public stateStore: Observable<AppState>, public actionMgr: ActionManager) {
        this.taskGenAlgos =[
            lootingTaskGenerator,
            selloffTaskGenerator,
        ];
        this.taskGenAlgos.sort((a, b) => {
            return b.priority - a.priority;
        })
        stateStore.subscribe((state: AppState) => {
            if (!state.hasActiveTask) {
                console.log('selecting task generator');
                const curAlgo = this.taskGenAlgos.find((algo: TaskGenerator) => {
                    return algo.shouldRun(state);
                })
                let newTask = curAlgo.generateTask(state);
        
                newTask.completionTimeoutId = setTimeout(this.taskCompleted.bind(this), newTask.durationMs, newTask);
                this.actionMgr.emitAction(new SetActiveTask(newTask));
            }
        })
    }

    // private generateRandomTask(): Task {
    //     const results = this.generateResults();
    //     const newTask: Task = {
    //         description: 'Do test ' + randRange(1, 100),
    //         durationMs: randRange(2, 5) * 1000,
    //         results: results
    //     };
    //     return newTask;
    // } 

    // private generateResults() {
    //     const resultOptions = [
    //         {'str': 1},
    //         {'maxHp': 2},
    //         {'spells': {'Tonguehairs': {rank: 1}}},
    //     ]
    //     let results = resultOptions[randRange(0, 2)];

    //     return results;
    // }

    private taskCompleted(completedTask: Task) {
        console.log(`Completed task: ${completedTask.description}.`);
        this.actionMgr.emitAction(new TaskCompleted(completedTask));
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