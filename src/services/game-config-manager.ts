import { NosqlDatastoreManager } from "./nosql-datastore-manager";
import { MajorRewardCoefficient, QuestRewardTypeOdds as QuestMajorRewardTypeOdds } from "../models/game-config-models";
import { TaskMode } from "../models/task-models";

const DEFAULT_COEFFICIENTS: MajorRewardCoefficient = {
    quadraticCoefficient: 5,
    linearCoefficient: 10,
    yIntercept: 20,
};
const DEFAULT_QUEST_MAJOR_REWARD_TYPE_ODDS: QuestMajorRewardTypeOdds = {
    membershipOdds: 1,
    officeOdds: 15,
}

export class GameConfigManager {
    public majorRewardCoefficients: MajorRewardCoefficient[];
    public questMajorRewardTypeOdds: QuestMajorRewardTypeOdds;
    private unsubscribeFunctions: Function[] = [];

    constructor (
        private datastoreMgr: NosqlDatastoreManager,
    ) {
        this.majorRewardCoefficients = Array(3).fill(DEFAULT_COEFFICIENTS);
        let unsubscribe = this.datastoreMgr.watchDocument('game-config', 'major-reward-coefficients', (updateData) => {
            if (!!updateData) {
                this.majorRewardCoefficients = [
                    updateData[TaskMode.LOOT_MODE],
                    updateData[TaskMode.TRIAL_MODE],
                    updateData[TaskMode.QUEST_MODE],
                ];
            }
        });
        this.unsubscribeFunctions.push(unsubscribe);

        this.questMajorRewardTypeOdds = DEFAULT_QUEST_MAJOR_REWARD_TYPE_ODDS;
        unsubscribe = this.datastoreMgr.watchDocument('game-config', 'quest-major-reward-type-odds', (updateData) => {
            if (!!updateData) {
                this.questMajorRewardTypeOdds = updateData;
            }
        })
    }

    onDestroy() {
        this.unsubscribeFunctions.forEach(u => u());
    }
}