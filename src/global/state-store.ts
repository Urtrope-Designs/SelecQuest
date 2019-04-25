import { Observable, zip } from 'rxjs';
import { scan, map } from 'rxjs/operators';
import { Action, SetActiveTask, TaskCompleted, ChangeActiveTaskMode, ActionType, SetActiveHero } from './actions';
import { Task, AppState, Hero } from '../models/models';
import { wrapIntoBehavior } from './utils';
import { TaskMode } from '../models/task-models';

function activeTask(initState: Task, actions: Observable<Action>) {
    return actions.pipe(
        scan((state: Task, action: Action) => {
            if (action.actionType === ActionType.SetActiveTask) {
                return (action as SetActiveTask).newTask;
            } else if (action.actionType === ActionType.SetActiveHero) {
                return (action as SetActiveHero).newGameState.activeTask;
            } else {
                return state;
            }
        }, initState)
    )
}

function hasActiveTask(initState: boolean, actions: Observable<Action>): Observable<boolean> {
    return actions.pipe(
        scan((state: boolean, action: Action) => {
            if (action.actionType === ActionType.SetActiveTask) {
                return true;
            } else if (action.actionType === ActionType.TaskCompleted) {
                return false;
            } else if (action.actionType === ActionType.SetActiveHero) {
                return (action as SetActiveHero).newGameState.hasActiveTask;
            } else {
                return state;
            }
        }, initState),
    );
}

function hero(initState: Hero, actions: Observable<Action>): Observable<Hero> {
    return actions.pipe(
        scan((state: Hero, action: Action) => {
            if (action.actionType == ActionType.TaskCompleted) {
                const updatedHero = (action as TaskCompleted).completedTask.resultingHero;
                return updatedHero;
            } else if (action.actionType == ActionType.SetActiveHero) {
                return (action as SetActiveHero).newGameState.hero;
            } else {
                return state;
            }
        }, initState),
    );
}

function activeTaskMode(initState: TaskMode, actions: Observable<Action>): Observable<number> {
    return actions.pipe(
        scan((state: number, action: Action) => {
            if (action.actionType === ActionType.ChangeActiveTaskMode) {
                return (action as ChangeActiveTaskMode).newTaskMode;
            } else if (action.actionType === ActionType.SetActiveHero) {
                return (action as SetActiveHero).newGameState.activeTaskMode;
            } else {
                return state;
            }
        }, initState),
    )
}


export function stateFn(initState: AppState, actions: Observable<Action>): Observable<AppState> {
    const combine = s => ({
        hero: s[0],
        activeTask: s[1],
        hasActiveTask: s[2],
        activeTaskMode: s[3],
    });
    const appStateObs: Observable<AppState> = 
        zip(
            hero(initState.hero, actions),
            activeTask(initState.activeTask, actions),
            hasActiveTask(initState.hasActiveTask, actions),
            activeTaskMode(initState.activeTaskMode, actions),
        ).pipe(
            map(combine),
        );
    return wrapIntoBehavior(initState, appStateObs);
}