import { AppState } from "../models/models";

export class GameDataTransformManager {

    public transformGameData(loadedState: AppState): AppState {
        if (!!loadedState['activeTask'] && !loadedState.currentTask) {
            loadedState.currentTask = loadedState['activeTask'];
            loadedState['activeTask'] = undefined;
        }
        return loadedState;
    }
}