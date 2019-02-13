import { Observable } from 'rxjs/Observable';
import { timer } from 'rxjs/observable/timer';
import { withLatestFrom } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Task, AppState } from '../models/models';
import { SetActiveTask, TaskCompleted, Action } from '../helpers/actions';
import { selectNextTaskGenerator } from '../helpers/play-task-helper';
import { GameSettingsManager } from '../services/game-settings-manager';

export default (function() {
    class PlayTaskManager {
        private gameSettingsMgr: GameSettingsManager;
        private stateStore: Observable<AppState>;
        private stateStoreSub: Subscription;
        private taskWatchTimerSub: Subscription;
        public taskAction$ = new BehaviorSubject<Action>(null);

        init(stateStore: Observable<AppState>, gameSettingsMgr: GameSettingsManager, emulateTaskTimeGap: boolean = false) {
            this.gameSettingsMgr = gameSettingsMgr;
            if (!!this.stateStoreSub) {                 // TODO: fix #18
                this.stateStoreSub.unsubscribe();
            }
            this.stateStore = stateStore;
            this.stateStore.subscribe((state: AppState) => {
                if (!!state && !!state.hero && !state.hasActiveTask) {
                    let nextTask = this.constructNextTask(state, emulateTaskTimeGap);

                    this.taskAction$.next(new SetActiveTask(nextTask));
                }
                else if (emulateTaskTimeGap && !!state && !!state.activeTask) {
                    if (this.isTaskCompleted(state.activeTask)) {
                        this.completeTask(state.activeTask);
                    } else {
                        emulateTaskTimeGap = false;
                        this.startTaskWatchTimer();
                    }
                }
            });

            if (!emulateTaskTimeGap) {
                this.startTaskWatchTimer();
            }
        }

        private constructNextTask(state: AppState, emulateTaskTimeGap: boolean): Task {
            const curGameSetting = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId);
            const curTaskGenerator = selectNextTaskGenerator(state);
            let newTask = curTaskGenerator.generateTask(state, curGameSetting);

            if (emulateTaskTimeGap && !!state.activeTask) {
                const twentyFourHoursAgo = new Date().getTime() - (1000 * 60 * 60 * 24);
                const minStartTime = Math.max(state.activeTask.taskStartTime, twentyFourHoursAgo);
                newTask.taskStartTime = minStartTime + state.activeTask.durationMs;
            } else {
                newTask.taskStartTime = new Date().getTime();
            }
            
            return newTask;
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
        init: (stateStore: Observable<AppState>, gameSettingsMgr: GameSettingsManager, emulateTaskTimeGap: boolean = false) => {
            privateInstance.init(stateStore, gameSettingsMgr, emulateTaskTimeGap);
        },
        getTaskAction$: () => {
            return privateInstance.taskAction$.asObservable();
        },
    };

    return exports;
})();
