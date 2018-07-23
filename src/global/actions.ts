import { Task, TaskMode } from "../helpers/models";

export enum ActionType {
    SetActiveTask,
    TaskCompleted,
    ChangeActiveTaskMode,
}

export class SetActiveTask {
    public actionType = ActionType.SetActiveTask;
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

export type Action =    SetActiveTask |
                        TaskCompleted |
                        ChangeActiveTaskMode;
