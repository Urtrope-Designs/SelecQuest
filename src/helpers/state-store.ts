import { Observable } from 'rxjs/Observable';
import { scan } from 'rxjs/operators/scan';
import { zip } from 'rxjs/operators/zip';
import { map } from 'rxjs/operators/map';
import { Action, SetActiveTask, TaskCompleted } from './actions';
import { Task, AppState, Character } from './models';
import { applyTaskResult } from './character-manager';
import { wrapIntoBehavior } from './utils';

function activeTask(initState: Task, actions: Observable<Action>) {
    return actions.pipe(
        scan((state: Task, action: Action) => {
            if (action instanceof SetActiveTask) {
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
            if (action instanceof SetActiveTask) {
                return true;
            }
            else if (action instanceof TaskCompleted) {
                return false;
            }
            else {
                return state;
            }
        }, initState),
    );
}

function character(initState: Character, actions: Observable<Action>): Observable<Character> {
    return actions.pipe(
        scan((state: Character, action: Action) => {
            if (action instanceof TaskCompleted) {
                const updatedCharacter = applyTaskResult(state, action.completedTask)
                console.log(updatedCharacter);
                return updatedCharacter;
            } else {
                return state;
            }
        }, initState),
    );
}



export function stateFn(initState: AppState, actions: Observable<Action>): Observable<AppState> {
    const combine = s => ({activeTask: s[0], hasActiveTask: s[1], character: s[2]});
    const appStateObs: Observable<AppState> = 
        activeTask(initState.activeTask, actions).pipe(
            zip(
                hasActiveTask(initState.hasActiveTask, actions),
                character(initState.character, actions),
            ),
            map(combine),
        );
    return wrapIntoBehavior(initState, appStateObs);
}