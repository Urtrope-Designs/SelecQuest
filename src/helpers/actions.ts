import { Task, TaskType } from "./models";

export class SetActiveTask {
    constructor(public newTask: Task) {}
}

export class TaskCompleted {
    constructor(public completedTask: Task) {}
}

export class ChangeActiveTaskType {
    constructor(public newTaskType: TaskType) {}
}

export type Action =    SetActiveTask |
                        TaskCompleted |
                        ChangeActiveTaskType;
