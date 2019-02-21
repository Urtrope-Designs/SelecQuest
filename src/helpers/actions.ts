import { Task, TaskMode, AppState } from "../models/models";
import { HeroManager } from "../services/hero-manager";

export enum ActionType {
    SetActiveTask,
    TaskCompleted,
    ChangeActiveTaskMode,
    SetActiveHero
}

export class SetActiveTask {
    public actionType = ActionType.SetActiveTask;
    constructor(public newTask: Task) {}
}

export class TaskCompleted {
    public actionType = ActionType.TaskCompleted;
    constructor(public completedTask: Task, public heroManager: HeroManager) {}
}

export class ChangeActiveTaskMode {
    public actionType = ActionType.ChangeActiveTaskMode;
    constructor(public newTaskMode: TaskMode) {}
}

export class SetActiveHero {
    public actionType = ActionType.SetActiveHero;
    constructor(public newGameState: AppState) {};
}

export type Action =    SetActiveTask |
                        TaskCompleted |
                        ChangeActiveTaskMode |
                        SetActiveHero;
