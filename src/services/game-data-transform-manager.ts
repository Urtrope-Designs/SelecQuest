import { AppState, TrialMajorReward } from "../models/models";
import { GameSettingsManager } from "./game-settings-manager";
import { randRange, factorialReduce } from "../global/utils";
import { HeroManager } from "./hero-manager";
import { GameConfigManager } from "./game-config-manager";

export class GameDataTransformManager {

    public transformGameData(loadedState: AppState, gameSettingMgr: GameSettingsManager, gameConfigMgr: GameConfigManager): AppState {
        const gameSetting = gameSettingMgr.getGameSettingById(loadedState.hero.gameSettingId);
        if (!!loadedState['activeTask'] && !loadedState.currentTask) {
            loadedState.currentTask = loadedState['activeTask'];
            loadedState['activeTask'] = undefined;
        }
        if (!!loadedState.hero.trialMajorRewards) {
            let prunedTrialMajorRewards: TrialMajorReward[] = [];
            loadedState.hero.trialMajorRewards.forEach(tMR => {
                if (gameSetting.trialMajorRewardTypes.some(tMRT => tMRT === tMR.type)) {
                    prunedTrialMajorRewards.push(tMR);
                }
            });
            loadedState.hero.trialMajorRewards = prunedTrialMajorRewards;
        }
        if (!loadedState.hero.trialCurrentCompetitiveClass) {
            loadedState.hero.trialCurrentCompetitiveClass = {
                competitiveClassName: gameSetting.trialCompetitiveClasses[0].competitiveClassName,
                competitiveClassMultiplier: 1,
                totalValueRequired: factorialReduce(1 + gameConfigMgr.competitiveClassLevelRange, 1, (value => Math.ceil(HeroManager.getXpRequiredForNextLevel(value) / 6.5) * value)),
                startingCurrencyValue: 0
            };
        }
        if (!loadedState.hero.trialRankings) {
            loadedState.hero.trialRankings = gameSetting.trialRankingSystems.map(rS => {
                const compClass = gameSetting.trialCompetitiveClasses.find(tCC => tCC.competitiveClassName === loadedState.hero.trialCurrentCompetitiveClass.competitiveClassName) || gameSetting.trialCompetitiveClasses[0];
                const maxDeviation = Math.round(compClass.totalRankCount * (rS.maxRankCountDeviationPercent / 100));
                const rank = randRange(compClass.totalRankCount - maxDeviation, compClass.totalRankCount + maxDeviation);
                return {rankingSystemName: rS.rankingSystemName, currentRanking: rank, worstRanking: rank, lastRankedValue: 0};
            });
        }
        if (!loadedState.hero.trialLastCalculatedRankingSystemIndex) {
            loadedState.hero.trialLastCalculatedRankingSystemIndex = -1;
        }
        if (!loadedState.hero.trialTitles) {
            loadedState.hero.trialTitles = [];
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
