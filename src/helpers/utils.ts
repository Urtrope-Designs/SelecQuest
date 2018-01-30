export function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export class Task {
    constructor (
        public description: string,
        public durationMs: number,
    ) { }
}


export class TaskManager {
    private curTask: Task;

    init() {
        this.startNewTask();
    }
    
    startNewTask() {
        this.curTask = this.generateRandomTask();
        setTimeout(this.taskCompleted.bind(this), this.curTask.durationMs, this.curTask);
    }

    generateRandomTask(): Task {
        let newTask = new Task('Do test ' + Math.ceil(Math.random() * 100), Math.ceil(Math.random() * 3 + 2) * 1000);
        return newTask;
    } 

    taskCompleted(completedTask: Task) {
        console.log(`Completed task: ${completedTask.description}.`);
        this.startNewTask();
    }
}
