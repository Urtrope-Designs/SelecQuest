import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Task } from './models';

export class TaskManager {
    private curTask: Task;
    private curTask$: BehaviorSubject<Task>;

    init() {
        this.curTask$ = new BehaviorSubject<Task>(this.generateRandomTask());
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
        this.startNewTask();
    }
}