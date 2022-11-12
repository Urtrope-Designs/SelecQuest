import { Observable, BehaviorSubject, timer, combineLatest } from 'rxjs';

import { Task, AppState } from '../models/models';
import { SetCurrentTask, TaskCompleted, Action } from '../global/actions';
import { ITaskGenerator } from '../models/task-models';

export class PlayTaskManager {
    public taskAction$ = new BehaviorSubject<Action>(null);

    constructor (
        private stateStore: Observable<AppState>,
        private playTaskGenerator: ITaskGenerator,
        private catchUpTaskGenerator: ITaskGenerator,
    ) {
        combineLatest([timer(1, 100), this.stateStore])
            .subscribe(([_timer, state]) => {
                if (!!state && !!state.hero && !state.hasActiveTask) {
                    let nextTask = this.constructNextTask(state);

                    this.taskAction$.next(new SetCurrentTask(nextTask));
                }
                if (!!state && !!state.currentTask && state.hasActiveTask && this.isTaskCompleted(state.currentTask)) {
                    this.completeTask(state.currentTask);
                }
            });
    }

    public getTaskAction$() {
        return this.taskAction$.asObservable();
    }

    private constructNextTask(state: AppState): Task {
        let newTask: Task;
        
        newTask = this.catchUpTaskGenerator.generateNextTask(state);
        if (newTask == null) {
            newTask = this.playTaskGenerator.generateNextTask(state);
            const nowTime = new Date().getTime();
            const startTime = !!state.currentTask ? Math.min(state.currentTask.taskStartTime + state.currentTask.durationMs, nowTime) : nowTime;
            newTask.taskStartTime = startTime;
        }
        
        return newTask;
    }

    private isTaskCompleted(task: Task): boolean {
        return (!!task && task.taskStartTime + task.durationMs <= new Date().getTime());
    }

    private completeTask(completedTask: Task) {
        this.taskAction$.next(new TaskCompleted(completedTask));
    }
}
