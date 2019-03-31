import { AppState, Task } from "./models";

export enum TaskMode {
    LOOT_MODE,
    TRIAL_MODE,
    QUEST_MODE,
}

export interface GameTaskGeneratorList {
    coreTaskGenerators: TaskGeneratorAlgorithm[],
    adventuringModeTaskGenerators: TaskGeneratorAlgorithm[][][],
}

export interface TaskGeneratorAlgorithm {
    shouldRun: (state: AppState) => boolean;
    generateTask: (state: AppState) => Task;
}


