import { AppState, Task } from "./models";

export enum TaskMode {
    LOOT_MODE,
    TRIAL_MODE,
    QUEST_MODE,
}

export interface GameTaskGeneratorList {
    coreTaskGenerators: TaskGenerator[],
    adventuringModeTaskGenerators: TaskGenerator[][][],
}

export interface TaskGenerator {
    shouldRun: (state: AppState) => boolean;
    generateTask: (state: AppState) => Task;
}
