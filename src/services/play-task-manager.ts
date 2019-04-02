import { Observable } from 'rxjs/Observable';
import { timer } from 'rxjs/observable/timer';
import { withLatestFrom } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Task, AppState } from '../models/models';
import { SetActiveTask, TaskCompleted, Action } from '../global/actions';
import { ITaskGenerator } from '../models/task-models';

export class PlayTaskManager {
    private stateStoreSub: Subscription;
    private taskWatchTimerSub: Subscription;
    public taskAction$ = new BehaviorSubject<Action>(null);

    constructor (
        private stateStore: Observable<AppState>,
        private playTaskGenerator: ITaskGenerator,
        private catchUpTaskGenerator: ITaskGenerator,
    ) {
        if (!!this.stateStoreSub) {                 // TODO: fix #18
            this.stateStoreSub.unsubscribe();
        }

        this.stateStore.subscribe((state: AppState) => {
            if (!!state && !!state.hero && !state.hasActiveTask) {
                let nextTask = this.constructNextTask(state);

                this.taskAction$.next(new SetActiveTask(nextTask));
            } else if (state.isInCatchUpMode && !!state && !!state.activeTask) {
                this.completeTask(state.activeTask);
            }

        });

        this.startTaskWatchTimer(stateStore);
    }

    public getTaskAction$() {
        return this.taskAction$.asObservable();
    }

    private constructNextTask(state: AppState): Task {
        let newTask: Task;
        
        if (state.isInCatchUpMode && !!state.activeTask) {
            newTask = this.catchUpTaskGenerator.generateNextTask(state) 
        } else {
            newTask = this.playTaskGenerator.generateNextTask(state);
            newTask.taskStartTime = new Date().getTime();
        }
        
        return newTask;
    }

    private startTaskWatchTimer(stateStore: Observable<AppState>) {
        if (!!this.taskWatchTimerSub) {
            this.taskWatchTimerSub.unsubscribe();
        }
        timer(1, 100).pipe(withLatestFrom(stateStore))
            .subscribe(([_timer, state]) => {
                if (!!state && !state.isInCatchUpMode &&  !!state.activeTask && this.isTaskCompleted(state.activeTask)) {
                    this.completeTask(state.activeTask);
                }
            })
    }

    private isTaskCompleted(task: Task): boolean {
        return (!!task && task.taskStartTime + task.durationMs <= new Date().getTime());
    }

    private completeTask(completedTask: Task) {
        this.taskAction$.next(new TaskCompleted(completedTask));
    }
}
