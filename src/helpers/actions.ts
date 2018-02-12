import { Task } from "./models";

export class SetActiveTask {
    constructor(public newTask: Task) {}
}

export class TaskCompleted {
    constructor(public completedTask: Task) {}
}

export type Action =    SetActiveTask |
                        TaskCompleted;
