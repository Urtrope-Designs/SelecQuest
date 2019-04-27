import { Observable, zip } from 'rxjs';
import { scan, map } from 'rxjs/operators';
import { Action, SetCurrentTask, TaskCompleted, ChangeActiveTaskMode, ActionType, SetActiveHero } from './actions';
import { Task, AppState, Hero } from '../models/models';
import { wrapIntoBehavior } from './utils';
import { TaskMode } from '../models/task-models';

function currentTask(initState: Task, actions: Observable<Action>) {
    return actions.pipe(
        scan((state: Task, action: Action) => {
            if (action.actionType === ActionType.SetCurrentTask) {
                return (action as SetCurrentTask).newTask;
            } else if (action.actionType === ActionType.SetActiveHero) {
                // bypass "catch-up" mode when switching active heroes
                const newHeroCurrentTask = (action as SetActiveHero).newGameState.currentTask;
                if (!!newHeroCurrentTask) {
                    newHeroCurrentTask.taskStartTime = Math.max(new Date().getTime() - newHeroCurrentTask.durationMs, newHeroCurrentTask.taskStartTime || 0);
                }
                return newHeroCurrentTask;
            } else {
                return state;
            }
        }, initState)
    )
}

function hasActiveTask(initState: boolean, actions: Observable<Action>): Observable<boolean> {
    return actions.pipe(
        scan((state: boolean, action: Action) => {
            if (action.actionType === ActionType.SetCurrentTask) {
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
        currentTask: s[1],
        hasActiveTask: s[2],
        activeTaskMode: s[3],
    });
    const appStateObs: Observable<AppState> = 
        zip(
            hero(initState.hero, actions),
            currentTask(initState.currentTask, actions),
            hasActiveTask(initState.hasActiveTask, actions),
            activeTaskMode(initState.activeTaskMode, actions),
        ).pipe(
            map(combine),
        );
    return wrapIntoBehavior(initState, appStateObs);
}