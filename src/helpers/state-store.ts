import { Observable } from 'rxjs/Observable';
import { zip } from 'rxjs/observable/zip';
import { scan } from 'rxjs/operators/scan';
import { map } from 'rxjs/operators/map';
import { Action, SetActiveTask, TaskCompleted, ChangeActiveTaskMode } from './actions';
import { Task, AppState, Character, TaskMode } from './models';
import { applyCharacterModifications, updateCharacterState, hasCharacterReachedNextLevel, getLevelUpModifications, getAdventureCompletedModifications } from './character-manager';
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
                const updatedCharacter = applyCharacterModifications(state, action.completedTask.results);
                const stateCheckedCharacter = updateCharacterState(updatedCharacter);
                const levelCheckedCharacter = hasCharacterReachedNextLevel(stateCheckedCharacter)
                    ? applyCharacterModifications(stateCheckedCharacter, getLevelUpModifications())
                    : stateCheckedCharacter;
                const adventureCheckedCharacter = levelCheckedCharacter.adventureProgress >= levelCheckedCharacter.currentAdventure.progressRequired
                    ? applyCharacterModifications(levelCheckedCharacter, getAdventureCompletedModifications(levelCheckedCharacter))
                    : levelCheckedCharacter;
                return adventureCheckedCharacter;
            } else {
                return state;
            }
        }, initState),
    );
}

function activeTaskMode(initState: TaskMode, actions: Observable<Action>): Observable<TaskMode> {
    return actions.pipe(
        scan((state: TaskMode, action: Action) => {
            if (action instanceof ChangeActiveTaskMode) {
                return action.newTaskMode;
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
        activeTaskMode: s[3],
    });
    const appStateObs: Observable<AppState> = 
        zip(
            character(initState.character, actions),
            activeTask(initState.activeTask, actions),
            hasActiveTask(initState.hasActiveTask, actions),
            activeTaskMode(initState.activeTaskMode, actions),
        ).pipe(
            map(combine),
        );
    return wrapIntoBehavior(initState, appStateObs);
}