import { AppState } from "../models/models";

export class GameDataTransformManager {

    public transformGameData(loadedState: AppState): AppState {
        if (!!loadedState['activeTask'] && !loadedState.currentTask) {
            loadedState.currentTask = loadedState['activeTask'];
            loadedState['activeTask'] = undefined;
        }
        if (!!loadedState.hero.questMajorRewards) {
            loadedState.hero.questMajorRewards = loadedState.hero.questMajorRewards.map(r => {
                if (typeof r.office === "string") {
                    r.office = {
                        officeName: r.office,
                        officeRank: 1,
                        officeIterationCount: 1,
                    };
                    return r;
                }
            })
        }
        return loadedState;
    }
}