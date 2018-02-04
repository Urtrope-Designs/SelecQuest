import { Observable } from "rxjs/Observable";
import { scan } from 'rxjs/operators/scan';
import { zip } from 'rxjs/operators/zip';
import { map } from 'rxjs/operators/map';
import { Action, setActiveTask, taskCompleted } from "./actions";
import { Task, AppState } from "./models";
import { wrapIntoBehavior } from './utils';

function activeTask(initState: Task, actions: Observable<Action>) {
    return actions.pipe(
        scan((state: Task, action: Action) => {
            if (action instanceof setActiveTask) {
                return action.newTask;
            }
            else {
                return state;
            }
        }, initState)
    )
}

function hasActiveTask(initState: boolean, actions: Observable<Action>): Observable<boolean> {
    return actions.pipe(
        scan((state: boolean, action: Action) => {
            if (action instanceof setActiveTask) {
                return true;
            }
            else if (action instanceof taskCompleted) {
                return false;
            }
            else {
                return state;
            }
        }, initState)
    )
}



function stateFn(initState: AppState, actions: Observable<Action>): Observable<AppState> {
    const combine = s => ({activeTask: s[0], hasActiveTask: s[1]});
    const appStateObs: Observable<AppState> = 
        activeTask(initState.activeTask, actions).pipe(
            zip(hasActiveTask(initState.hasActiveTask, actions)),
            map(combine),
        );
    return wrapIntoBehavior(initState, appStateObs);
}