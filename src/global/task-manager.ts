import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Task, AppState } from '../helpers/models';
import { SetActiveTask, TaskCompleted, Action } from '../helpers/actions';
import { TaskGenerator, PRIORITIZED_TASK_GENERATORS } from '../helpers/task-helper';

export default (function() {
    class TaskManager {
        private taskGenAlgos: TaskGenerator[] = PRIORITIZED_TASK_GENERATORS;
        private stateStore: Observable<AppState>
        public taskAction$ = new Subject<Action>();

        init(stateStore: Observable<AppState>) {
            this.stateStore = stateStore;
            this.stateStore.subscribe((state: AppState) => {
                if (!state.hasActiveTask) {
                    const curAlgo = this.taskGenAlgos.find((algo: TaskGenerator) => {
                        return algo.shouldRun(state);
                    })
                    let newTask = curAlgo.generateTask(state);
            
                    setTimeout(() => {
                        newTask.taskStartTime = new Date().getTime();
                        newTask.completionTimeoutId = setTimeout(this.completeTask.bind(this), newTask.durationMs, newTask);
                        this.taskAction$.next(new SetActiveTask(newTask));
                    }, 10)
                }
            });
        }

        private completeTask(completedTask: Task) {
            this.taskAction$.next(new TaskCompleted(completedTask));
        }
    }
    
    const privateInstance = new TaskManager();

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
