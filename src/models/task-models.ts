import { AppState, Task } from "./models";
import { GameSetting } from "../helpers/game-setting";

export interface GameTaskGeneratorList {
    coreTaskGenerators: TaskGenerator[],
    adventuringModeTaskGenerators: TaskGenerator[][][],
}

export interface TaskGenerator {
    shouldRun: (state: AppState) => boolean;
    generateTask: (state: AppState, gameSetting: GameSetting) => Task;
}