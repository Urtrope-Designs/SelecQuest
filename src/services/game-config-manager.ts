import { NosqlDatastoreManager } from "./nosql-datastore-manager";
import { MajorRewardCoefficient, QuestRewardTypeOdds as QuestMajorRewardTypeOdds, EnvironmentalLimitCoefficient } from "../models/game-config-models";
import { TaskMode } from "../models/task-models";

const DEFAULT_COEFFICIENTS: MajorRewardCoefficient = {
    quadraticCoefficient: 5,
    linearCoefficient: 10,
    yIntercept: 20,
};
const DEFAULT_QUEST_MAJOR_REWARD_TYPE_ODDS: QuestMajorRewardTypeOdds = {
    connectionOdds: 1,
    membershipOdds: 5,
    officeOdds: 15,
}
const DEFAULT_ENVIRONMENTAL_LIMIT_COEFFICIENT: EnvironmentalLimitCoefficient = {
    levelAddend: 50,
    levelCoefficient: 60,
    limitingStatAddend: 0,
    limitingStatCoefficient: 15,
    limitingStatExponent: 0.8,
    limitingStatLevelExponent: 0.5,
}
const DEFAULT_COMPETITIVE_CLASS_LEVEL_RANGE: number = 6;
const DEFAULT_COMPETITIVE_CLASS_GRADUATION_CHANCE_COEFFICIENT: number = 5;
const DEFAULT_TRIAL_MAJOR_REWARD_COUNT_LIMIT: number = 8;

export class GameConfigManager {
    public majorRewardCoefficients: MajorRewardCoefficient[];
    public questMajorRewardTypeOdds: QuestMajorRewardTypeOdds;
    public environmentalLimitCoefficients: EnvironmentalLimitCoefficient[];
    public competitiveClassLevelRange: number;
    public competitiveClassGraduationChanceCoefficient: number;
    public trialMajorRewardCountLimit: number;
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
        });
        this.unsubscribeFunctions.push(unsubscribe);
        
        this.environmentalLimitCoefficients = Array(3).fill(DEFAULT_ENVIRONMENTAL_LIMIT_COEFFICIENT);
        unsubscribe = this.datastoreMgr.watchDocument('game-config', 'environmental-limit-coefficients', (updateData) => {
            if (!!updateData) {
                this.environmentalLimitCoefficients = [
                    updateData[TaskMode.LOOT_MODE],
                    updateData[TaskMode.TRIAL_MODE],
                    updateData[TaskMode.QUEST_MODE],
                ]
            }
        });
        this.unsubscribeFunctions.push(unsubscribe);

        this.competitiveClassLevelRange = DEFAULT_COMPETITIVE_CLASS_LEVEL_RANGE;
        unsubscribe = this.datastoreMgr.watchDocument('game-config', 'competitive-class-level-range', (updateData) => {
            if (!!updateData) {
                this.competitiveClassLevelRange = updateData.competitiveClassLevelRange;
            }
        });
        this.unsubscribeFunctions.push(unsubscribe);

        this.competitiveClassGraduationChanceCoefficient = DEFAULT_COMPETITIVE_CLASS_GRADUATION_CHANCE_COEFFICIENT;
        unsubscribe = this.datastoreMgr.watchDocument('game-config', 'competitive-class-graduation-chance-coefficient', (updateData) => {
            if (!!updateData) {
                this.competitiveClassGraduationChanceCoefficient = updateData.competitiveClassGraduationChanceCoefficient;
            }
        });
        this.unsubscribeFunctions.push(unsubscribe);

        this.competitiveClassGraduationChanceCoefficient = DEFAULT_TRIAL_MAJOR_REWARD_COUNT_LIMIT;
        unsubscribe = this.datastoreMgr.watchDocument('game-config', 'trial-major-reward-count-limit', (updateData) => {
            if (!!updateData) {
                this.trialMajorRewardCountLimit = updateData.trialMajorRewardCountLimit;
            }
        });
        this.unsubscribeFunctions.push(unsubscribe);
    }

    onDestroy() {
        this.unsubscribeFunctions.forEach(u => u());
    }
}