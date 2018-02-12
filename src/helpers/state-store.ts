import { Observable } from 'rxjs/Observable';
import { zip } from 'rxjs/observable/zip';
import { scan } from 'rxjs/operators/scan';
import { map } from 'rxjs/operators/map';
import { Action, SetActiveTask, TaskCompleted, ChangeActiveTaskType } from './actions';
import { Task, AppState, Character, TaskType } from './models';
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
                return updatedCharacter;
            } else {
                return state;
            }
        }, initState),
    );
}

function activeTaskType(initState: TaskType, actions: Observable<Action>): Observable<TaskType> {
    return actions.pipe(
        scan((state: TaskType, action: Action) => {
            if (action instanceof ChangeActiveTaskType) {
                return action.newTaskType;
            } else {
                return state;
            }
        }, initState),
    )
}



export function stateFn(initState: AppState, actions: Observable<Action>): Observable<AppState> {
    const combine = s => ({
        character: s[0],
        activeTask: s[1],
        hasActiveTask: s[2],
        activeTaskType: s[3],
    });
    const appStateObs: Observable<AppState> = 
        zip(
            character(initState.character, actions),
            activeTask(initState.activeTask, actions),
            hasActiveTask(initState.hasActiveTask, actions),
            activeTaskType(initState.activeTaskType, actions),
        ).pipe(
            map(combine),
        );
    return wrapIntoBehavior(initState, appStateObs);
}