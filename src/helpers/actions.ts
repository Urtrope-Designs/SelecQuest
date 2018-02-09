import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Task } from "./models";

export class SetActiveTask {
    constructor(public newTask: Task) {}
}

export class TaskCompleted {
    constructor(public completedTask: Task) {}
}

export type Action =    SetActiveTask |
                        TaskCompleted;

export class ActionManager {
    private actionSubject: Subject<Action>;

    constructor() {
        this.actionSubject = new Subject<Action>();
    }

    getActionManager(): Observable<Action> {
        return this.actionSubject.asObservable();
    }

    emitAction(action: Action) {
        this.actionSubject.next(action);
    }
}