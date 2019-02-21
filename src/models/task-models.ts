import { AppState, Task } from "./models";

export interface GameTaskGeneratorList {
    coreTaskGenerators: TaskGenerator[],
    adventuringModeTaskGenerators: TaskGenerator[][][],
}

export interface TaskGenerator {
    shouldRun: (state: AppState) => boolean;
    generateTask: (state: AppState) => Task;
}
