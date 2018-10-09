import { Observable } from 'rxjs/Observable';
import { timer } from 'rxjs/observable/timer';
import { withLatestFrom } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Task, AppState } from '../helpers/models';
import { SetActiveTask, TaskCompleted, Action } from '../helpers/actions';
import { TaskGenerator, PRIORITIZED_TASK_GENERATORS } from '../helpers/play-task-helper';

export default (function() {
    class PlayTaskManager {
        private taskGenAlgos: TaskGenerator[] = PRIORITIZED_TASK_GENERATORS;
        private stateStore: Observable<AppState>;
        private stateStoreSub: Subscription;
        private taskWatchTimerSub: Subscription;
        public taskAction$ = new BehaviorSubject<Action>(null);

        init(stateStore: Observable<AppState>, emulateTaskTimeGap: boolean = false) {
            if (!!this.stateStoreSub) {
                this.stateStoreSub.unsubscribe();
            }
            this.stateStore = stateStore;
            this.stateStore.subscribe((state: AppState) => {
                if (!!state && !!state.hero && !state.hasActiveTask) {
                    const curAlgo = this.taskGenAlgos.find((algo: TaskGenerator) => {
                        return algo.shouldRun(state);
                    })
                    let newTask = curAlgo.generateTask(state);
                    console.log('new')
                    if (emulateTaskTimeGap && !!state.activeTask) {
                        const twentyFourHoursAgo = new Date().getTime() - (1000 * 60 * 60 * 24);
                        const minStartTime = Math.max(state.activeTask.taskStartTime, twentyFourHoursAgo);
                        newTask.taskStartTime = minStartTime + state.activeTask.durationMs;
                    } else {
                        newTask.taskStartTime = new Date().getTime();
                    }
                    this.taskAction$.next(new SetActiveTask(newTask));
                }
                else if (emulateTaskTimeGap && !!state && !!state.activeTask) {
                    if (!this.isTaskCompleted(state.activeTask)) {
                        emulateTaskTimeGap = false;
                        this.startTaskWatchTimer();
                        console.log('just once!')
                    } else {
                        this.completeTask(state.activeTask);
                        console.log('many');
                    }
                }
            });

            if (!emulateTaskTimeGap) {
                this.startTaskWatchTimer();
            }
        }

        private startTaskWatchTimer() {
            if (!!this.taskWatchTimerSub) {
                this.taskWatchTimerSub.unsubscribe();
            }
            timer(1, 100).pipe(withLatestFrom(this.stateStore))
                .subscribe(([_timer, state]) => {
                    if (!!state && !!state.activeTask && this.isTaskCompleted(state.activeTask)) {
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
    
    const privateInstance = new PlayTaskManager();

    const exports = {
        init: (stateStore: Observable<AppState>, emulateTaskTimeGap: boolean = false) => {
            privateInstance.init(stateStore, emulateTaskTimeGap);
        },
        getTaskAction$: () => {
            return privateInstance.taskAction$.asObservable();
        },
    };

    return exports;
})();
