import { Observable } from 'rxjs/Observable';

import { Task, AppState } from './models';
import { ActionManager, SetActiveTask, TaskCompleted } from './actions';

export class TaskManager {
    private curTask: Task;

    constructor(public stateStore: Observable<AppState>, public actionMgr: ActionManager) {
        stateStore.subscribe((state: AppState) => {
            if (!state.hasActiveTask) {
                let newTask = this.generateRandomTask();
                newTask.completionTimeoutId = setTimeout(this.taskCompleted.bind(this), newTask.durationMs, newTask);
                this.actionMgr.emitAction(new SetActiveTask(newTask));
            }
        })
    }

    init() {
        this.startNewTask();
    }
    
    startNewTask() {
        this.curTask = this.generateRandomTask();
        setTimeout(this.taskCompleted.bind(this), this.curTask.durationMs, this.curTask);
    }

    generateRandomTask(): Task {
        let newTask = new Task('Do test ' + Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 3 + 2) * 1000);
        return newTask;
    } 

    taskCompleted(completedTask: Task) {
        console.log(`Completed task: ${completedTask.description}.`);
        this.actionMgr.emitAction(new TaskCompleted(completedTask));
    }
}