export class Task {
    public completionTimeoutId: any;

    constructor (
        public description: string,
        public durationMs: number,
    ) { }
}

export interface AppState {
    activeTask: Task;
    hasActiveTask: boolean;
}