import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Task, AppState } from '../helpers/models';
import { SetActiveTask, TaskCompleted, Action } from '../helpers/actions';
import { TaskGenerator, PRIORITIZED_TASK_GENERATORS } from '../helpers/play-task-helper';

export default (function() {
    class PlayTaskManager {
        private taskGenAlgos: TaskGenerator[] = PRIORITIZED_TASK_GENERATORS;
        private stateStore: Observable<AppState>
        public taskAction$ = new Subject<Action>();

        init(stateStore: Observable<AppState>) {
            // TODO: try using RXJS timer() to create an observable that emits every 100 ms; then check if task is done
            this.stateStore = stateStore;
            this.stateStore.subscribe((state: AppState) => {
                if (!!state && !!state.hero && !state.hasActiveTask) {
                    const curAlgo = this.taskGenAlgos.find((algo: TaskGenerator) => {
                        return algo.shouldRun(state);
                    })
                    let newTask = curAlgo.generateTask(state);
            
                    newTask.taskStartTime = new Date().getTime();
                    newTask.completionTimeoutId = setTimeout(this.completeTask.bind(this), newTask.durationMs, newTask);
                    this.taskAction$.next(new SetActiveTask(newTask));
                }
            });
        }

        private completeTask(completedTask: Task) {
            this.taskAction$.next(new TaskCompleted(completedTask));
        }
    }
    
    const privateInstance = new PlayTaskManager();

    const exports = {
        init: (stateStore: Observable<AppState>) => {
            privateInstance.init(stateStore);
        },
        getTaskAction$: () => {
            return privateInstance.taskAction$.asObservable();
        },
    };

    return exports;
})();
