import { Task, AppState } from "../models/models";
import { TaskMode } from "../models/task-models";

export enum ActionType {
    SetCurrentTask,
    TaskCompleted,
    ChangeActiveTaskMode,
    SetActiveHero,
}

export class SetCurrentTask {
    public actionType = ActionType.SetCurrentTask;
    constructor(public newTask: Task) {}
}

export class TaskCompleted {
    public actionType = ActionType.TaskCompleted;
    constructor(public completedTask: Task) {}
}

export class ChangeActiveTaskMode {
    public actionType = ActionType.ChangeActiveTaskMode;
    constructor(public newTaskMode: TaskMode) {}
}

export class SetActiveHero {
    public actionType = ActionType.SetActiveHero;
    constructor(public newGameState: AppState) {};
}


export type Action =    SetCurrentTask |
                        TaskCompleted |
                        ChangeActiveTaskMode |
                        SetActiveHero;
