import { Task, TaskMode } from "./models";

export class SetActiveTask {
    constructor(public newTask: Task) {}
}

export class TaskCompleted {
    constructor(public completedTask: Task) {}
}

export class ChangeActiveTaskMode {
    constructor(public newTaskMode: TaskMode) {}
}

export type Action =    SetActiveTask |
                        TaskCompleted |
                        ChangeActiveTaskMode;
