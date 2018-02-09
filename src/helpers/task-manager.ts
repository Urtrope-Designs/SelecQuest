import { Observable } from 'rxjs/Observable';

import { Task, AppState } from './models';
import { ActionManager, SetActiveTask, TaskCompleted } from './actions';

export class TaskManager {
    constructor(public stateStore: Observable<AppState>, public actionMgr: ActionManager) {
        stateStore.subscribe((state: AppState) => {
            if (!state.hasActiveTask) {
                let newTask = this.generateRandomTask();
                newTask.completionTimeoutId = setTimeout(this.taskCompleted.bind(this), newTask.durationMs, newTask);
                this.actionMgr.emitAction(new SetActiveTask(newTask));
            }
        })
    }

    private generateRandomTask(): Task {
        const results = this.generateResults();
        const newTask: Task = {
            description: 'Do test ' + Math.ceil(Math.random() * 100),
            durationMs: Math.ceil(Math.random() * 3 + 2) * 1000,
            results: results
        };
        return newTask;
    } 

    private generateResults() {
        const resultOptions = [
            {'str': 1},
            {'maxHp': 2},
            {'spells': {'Tonguehairs': {rank: 1}}},
        ]
        let results = resultOptions[Math.floor(Math.random() * 3)];

        return results;
    }

    private taskCompleted(completedTask: Task) {
        console.log(`Completed task: ${completedTask.description}.`);
        this.actionMgr.emitAction(new TaskCompleted(completedTask));
    }
}