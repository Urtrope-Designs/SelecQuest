import { Task } from "./models";

export class setActiveTask {
    constructor(public newTask: Task) {}
}

export class taskCompleted {
    constructor(public completedTask: Task) {}
}

export type Action =    setActiveTask |
                        taskCompleted;