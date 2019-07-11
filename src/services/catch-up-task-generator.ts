import { ITaskGenerator, TaskMode } from "../models/task-models";
import { AppState, Task, Hero, HeroModification, HeroModificationType } from "../models/models";
import { HeroManager } from "./hero-manager";
import { PlayTaskResultGenerator } from "./play-task-result-generator";
import { GameSettingsManager } from "./game-settings-manager";
import { PlayTaskGenerator } from "./play-task-generator";
import { GameConfigManager } from "./game-config-manager";
import { randRange } from "../global/utils";

export class CatchUpTaskGenerator implements ITaskGenerator{

    constructor(
        private taskResultGenerator: PlayTaskResultGenerator,
        private heroMgr: HeroManager,
        private gameSettingsMgr: GameSettingsManager,
        private gameConfigMgr: GameConfigManager,
    ) {
    }

    generateNextTask(state: AppState): Task {
        if (!state.currentTask) {
            return null;
        }

        const nowTime = new Date().getTime();
        const oneWeekAgo = nowTime - (1000 * 60 * 60 * 24 * 7);
        const startingPoint = Math.min(Math.max((state.currentTask.taskStartTime + state.currentTask.durationMs), oneWeekAgo), nowTime);
        const totalTimeToCatchUpMs = nowTime - startingPoint;
        const averageAdvancementTaskLength = 6.5;
        const isEnvironmentalLimitBroken = state.activeTaskMode == TaskMode.LOOT_MODE ? state.hero.lootEnvironmentalLimit >= state.hero.maxLootEnvironmentalLimit
            : state.activeTaskMode == TaskMode.TRIAL_MODE ? state.hero.trialEnvironmentalLimit >= state.hero.maxTrialEnvironmentalLimit
            : state.hero.questEnvironmentalLimit >= state.hero.maxQuestEnvironmentalLimit;
        const buildUpLimit = state.activeTaskMode == TaskMode.LOOT_MODE ? state.hero.maxLootBuildUp 
            : state.activeTaskMode == TaskMode.TRIAL_MODE ? state.hero.maxTrialBuildUp 
            : state.hero.maxQuestBuildUp;

        const {nearestMilestone, cyclesToNextMilestone, timeToNextMilestoneMs} = this.determineNearestMilestone(state, totalTimeToCatchUpMs, buildUpLimit, averageAdvancementTaskLength, isEnvironmentalLimitBroken); 
        
        const newTask = this.buildTaskResults(state, startingPoint, cyclesToNextMilestone, timeToNextMilestoneMs, nearestMilestone, buildUpLimit, averageAdvancementTaskLength, isEnvironmentalLimitBroken);

        
        return newTask;
    }
    
    private determineNearestMilestone(state: AppState, totalTimeToCatchUpMs: number, buildUpLimit: number, averageAdvancementTaskLength: number, isEnvironmentalLimitBroken: boolean): { nearestMilestone: CatchUpMilestones, cyclesToNextMilestone: number, timeToNextMilestoneMs: number } {
        let cyclesToNextMilestone = this.determineCyclesToCatchUp(totalTimeToCatchUpMs, state.activeTaskMode, buildUpLimit, averageAdvancementTaskLength);
        let nearestMilestone = CatchUpMilestones.CATCH_UP;
        
        const cyclesToNextAdventure = this.determineCyclesToAdventureComplete(state.hero, buildUpLimit, averageAdvancementTaskLength, isEnvironmentalLimitBroken);
        if (cyclesToNextAdventure < cyclesToNextMilestone) {
            cyclesToNextMilestone = cyclesToNextAdventure;
            nearestMilestone = CatchUpMilestones.COMPLETE_ADVENTURE;
        }
        
        const cyclesToLevelUp = this.determineCyclesToLevelUp(state.hero, buildUpLimit, averageAdvancementTaskLength, isEnvironmentalLimitBroken);
        if (cyclesToLevelUp < cyclesToNextMilestone) {
            cyclesToNextMilestone = cyclesToLevelUp;
            nearestMilestone = CatchUpMilestones.LEVEL_UP;
        }
        
        if (!isEnvironmentalLimitBroken) {
            const cyclesToEnvironmentalLimitBreak = this.determineCyclesToEnvironmentalLimitBreak(state.hero, state.activeTaskMode, buildUpLimit);
            if (cyclesToEnvironmentalLimitBreak < cyclesToNextMilestone) {
                cyclesToNextMilestone = cyclesToEnvironmentalLimitBreak;
                nearestMilestone = CatchUpMilestones.ENVIRONMENTAL_LIMIT_BREAK;
            }
        }

        // get us closer to catching up without going over
        if (nearestMilestone == CatchUpMilestones.CATCH_UP) {
            cyclesToNextMilestone -= 2;
        }

        const timeToNextMilestoneMs = this.determineTotalTimeFromCyclesMs(cyclesToNextMilestone, state.activeTaskMode, buildUpLimit, averageAdvancementTaskLength);

        
        return {nearestMilestone: nearestMilestone, cyclesToNextMilestone: cyclesToNextMilestone, timeToNextMilestoneMs: timeToNextMilestoneMs};
    }

    private determineCyclesToCatchUp(totalTimeToCatchUpMs: number, taskMode: TaskMode, buildUpLimit: number, averageAdvancementTaskLength: number): number {
        const fullCycleDuration = this.determineFullCycleDurationMs(taskMode, buildUpLimit, averageAdvancementTaskLength);

        return Math.ceil(totalTimeToCatchUpMs / fullCycleDuration);
    }

    private determineXpGainedPerCycle(buildUpLimit: number, averageAdvancementTaskLength: number, isEnvironmentalLimitBroken: boolean): number {
        const xpGainedPerCycle = Math.ceil(buildUpLimit * averageAdvancementTaskLength / (isEnvironmentalLimitBroken ? 2 : 1));
        return xpGainedPerCycle;
    }
    
    private determineCyclesToLevelUp(hero: Hero, buildUpLimit: number, averageAdvancementTaskLength: number, isEnvironmentalLimitBroken: boolean): number {
        const xpNeededToLevelUp = HeroManager.getXpRequiredForNextLevel(hero.level);
        const xpGainedPerCycle = this.determineXpGainedPerCycle(buildUpLimit, averageAdvancementTaskLength, isEnvironmentalLimitBroken);

        if (xpNeededToLevelUp < xpGainedPerCycle) {
            return 0;
        }

        const cyclesToNextLevel = Math.ceil(xpNeededToLevelUp / xpGainedPerCycle);

        return cyclesToNextLevel;
    }

    private determineApGainedPerCycle(buildUpLimit: number, averageAdvancementTaskLength: number, isEnvironmentalLimitBroken: boolean): number {
        const apGainedPerCycle = Math.ceil(buildUpLimit * averageAdvancementTaskLength / (isEnvironmentalLimitBroken ? 2 : 1));
        return apGainedPerCycle;
    }
    
    private determineCyclesToAdventureComplete(hero: Hero, buildUpLimit: number, averageAdvancementTaskLength: number, isEnvironmentalLimitBroken: boolean): number {
        const apNeededToCompleteAdventure = hero.currentAdventure.progressRequired - hero.adventureProgress;
        const apGainedPerCycle = this.determineApGainedPerCycle(buildUpLimit, averageAdvancementTaskLength, isEnvironmentalLimitBroken);

        if (apNeededToCompleteAdventure < apGainedPerCycle) {
            return 0;
        }

        const cyclesToNextAdventure = Math.ceil(apNeededToCompleteAdventure / apGainedPerCycle);

        return cyclesToNextAdventure;
    }

    private determineCyclesToEnvironmentalLimitBreak(hero: Hero, taskMode: TaskMode, buildUpLimit: number): number {
        const advancementUntilLimit = taskMode == TaskMode.LOOT_MODE ? hero.maxLootEnvironmentalLimit - hero.lootEnvironmentalLimit
                                            : taskMode == TaskMode.TRIAL_MODE ? hero.maxTrialEnvironmentalLimit - hero.trialEnvironmentalLimit
                                            : hero.maxQuestEnvironmentalLimit - hero.questEnvironmentalLimit;

        const advancementGainedPerCycle = buildUpLimit;

        if (advancementUntilLimit < advancementGainedPerCycle) {
            return 0;
        }

        const cyclesToEnvironmentalLimit = Math.ceil(advancementUntilLimit / advancementGainedPerCycle);

        return cyclesToEnvironmentalLimit;
    }

    private determineFullCycleDurationMs(taskMode: TaskMode, buildUpLimit: number, averageAdvancementTaskLength: number) {
        const averageOffAdvancementTasksPerCycle = taskMode == TaskMode.QUEST_MODE ? buildUpLimit : .9 * buildUpLimit;
    
        const fullCycleDurationSeconds = 4 + averageAdvancementTaskLength * buildUpLimit + 4 + averageOffAdvancementTasksPerCycle + 5;

        return fullCycleDurationSeconds * 1000;
    }

    private determineTotalTimeFromCyclesMs(cyclesToNextMilestone: number, taskMode: TaskMode, buildUpLimit: number, averageAdvancementTaskLength: number) {
        const fullCycleDurationMs = this.determineFullCycleDurationMs(taskMode, buildUpLimit, averageAdvancementTaskLength);
        const totalTimeMs = cyclesToNextMilestone * fullCycleDurationMs;

        return totalTimeMs;
    }

    private generateResultingHero(baseHero: Hero, modifications: HeroModification[]): Hero {
        let updatedHero: Hero = this.heroMgr.applyHeroTaskUpdates(baseHero, modifications);
        if (HeroManager.hasHeroReachedNextLevel(updatedHero)) {
            const levelUpMods = this.taskResultGenerator.generateLevelUpModifications(updatedHero)
            updatedHero = this.heroMgr.applyHeroModifications(updatedHero, levelUpMods, false);
        }
        return updatedHero;
    }

    private buildTaskResults(state: AppState, startingPoint: number, cyclesToNextMilestone: number, timeToNextMilestoneMs: number, nearestMilestone: CatchUpMilestones, buildUpLimit: number, averageAdvancementTaskLength: number, isEnvironmentalLimitBroken: boolean): Task {
        if (cyclesToNextMilestone <= 0) {
            return null;
        }

        const catchUpTaskDescription = CatchUpMilestones[nearestMilestone] + ' Catchup';

        const curGameSetting = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId)
        const prologueAdventureName = curGameSetting.prologueAdventureName;
        if (state.hero.currentAdventure.name == prologueAdventureName) {
            const actualDurationSeconds = state.hero.currentAdventure.progressRequired;
            const modifications = this.taskResultGenerator.generateNewAdventureResults(state.hero, false);
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: catchUpTaskDescription,
                durationMs: actualDurationSeconds * 1000,
                resultingHero: updatedHero,
                taskStartTime: startingPoint,
            };


            return newTask;
        }

        const xpGainedPerCycle = this.determineXpGainedPerCycle(buildUpLimit, averageAdvancementTaskLength, isEnvironmentalLimitBroken);
        const totalXpEarned = cyclesToNextMilestone * xpGainedPerCycle;

        const apGainedPerCycle = this.determineApGainedPerCycle(buildUpLimit, averageAdvancementTaskLength, isEnvironmentalLimitBroken);
        const totalApEarned = cyclesToNextMilestone * apGainedPerCycle;

        const environmentalLimitGainedPerCycle = buildUpLimit;
        const totalEnvironmentalLimitGained = cyclesToNextMilestone * environmentalLimitGainedPerCycle;
        const totalOffModeEnvironmentalLimitReduced = cyclesToNextMilestone * environmentalLimitGainedPerCycle * -2;
        const allEnvironmentalLimitAttributeNames = [
            'lootEnvironmentalLimit',
            'trialEnvironmentalLimit',
            'questEnvironmentalLimit',
        ]
        const activevModeEnvironmentalLimitAttributeName = allEnvironmentalLimitAttributeNames[state.activeTaskMode];
        const offModeEnvironmentalLimitAttributeNames = allEnvironmentalLimitAttributeNames.filter(n => n != activevModeEnvironmentalLimitAttributeName);

        const currencyGained = buildUpLimit * state.hero.level * cyclesToNextMilestone / (isEnvironmentalLimitBroken ? 2 : 1);

        const allBuildUpRewardAttributeNames = [
            'lootBuildUpRewards',
            'trialBuildUpRewards',
            'questBuildUpRewards'
        ]
        const activeModeBuildUpRewardAttributeName = allBuildUpRewardAttributeNames[state.activeTaskMode];

        let modifications: HeroModification[] = [
            {
                type: HeroModificationType.INCREASE,
                attributeName: 'currentXp',
                data: totalXpEarned,
            },
            {
                type: HeroModificationType.INCREASE,
                attributeName: 'adventureProgress',
                data: totalApEarned,
            },
            {
                type: HeroModificationType.INCREASE,
                attributeName: activevModeEnvironmentalLimitAttributeName,
                data: totalEnvironmentalLimitGained,
            },
            {
                type: HeroModificationType.DECREASE,
                attributeName: offModeEnvironmentalLimitAttributeNames[0],
                data: totalOffModeEnvironmentalLimitReduced,
            },
            {
                type: HeroModificationType.DECREASE,
                attributeName: offModeEnvironmentalLimitAttributeNames[1],
                data: totalOffModeEnvironmentalLimitReduced,
            },
            {
                type: HeroModificationType.ADD_CURRENCY,
                attributeName: 'currency',
                data: [{index: state.activeTaskMode, value: currencyGained}],
            },
            {
                type: HeroModificationType.SET,
                attributeName: activeModeBuildUpRewardAttributeName,
                data: [],
            },
            {
                type: HeroModificationType.SET_FOR_MODE,
                attributeName: 'isInTeardownMode',
                data: [{index: state.activeTaskMode, value: true}],
            },
        ];

        let resultingHero = this.generateResultingHero(state.hero, modifications);

        // update all ranking systems
        const systemsToRank = Math.min(cyclesToNextMilestone, curGameSetting.trialRankingSystems.length);
        for (let i = 0; i < systemsToRank; i++) {
            modifications = [
                ...this.taskResultGenerator.generateTrialRankingUpdateModifications(resultingHero),
                {
                    type: HeroModificationType.SET_FOR_MODE,
                    attributeName: 'hasTrialRankingBeenRecalculated',
                    data: [{index: state.activeTaskMode, value: true}],
                },
            ];
            resultingHero = this.generateResultingHero(resultingHero, modifications);
        }

        const minCurrency = this.taskResultGenerator.getTradeInCostForLevel(state.activeTaskMode, state.hero.level);
        while ((resultingHero.currency[state.activeTaskMode] - resultingHero.spentCurrency[state.activeTaskMode]) >= minCurrency) {
            let rewardLevel = state.hero.level;
            let newMajorRewardMods: HeroModification[];
            if (state.activeTaskMode == TaskMode.LOOT_MODE) {
                rewardLevel = Math.max(Math.min(PlayTaskGenerator.randomizeTargetLevel(rewardLevel), rewardLevel), rewardLevel-4, 1);
                newMajorRewardMods = [this.taskResultGenerator.generateNewLootMajorRewardModification(rewardLevel, resultingHero.lootMajorRewards, curGameSetting)];
            } else if (state.activeTaskMode == TaskMode.TRIAL_MODE) {
                newMajorRewardMods = this.taskResultGenerator.generateNewTrialMajorRewardModifications(resultingHero);
            } else {
                newMajorRewardMods = [this.taskResultGenerator.generateNewQuestMajorRewardModification(resultingHero)];
            }
            modifications = [
                ...newMajorRewardMods,
                {
                    type: HeroModificationType.ADD_CURRENCY,
                    attributeName: 'spentCurrency',
                    data: [{index: state.activeTaskMode, value: this.taskResultGenerator.getTradeInCostForLevel(state.activeTaskMode, rewardLevel)}],
                },
            ];
            resultingHero = this.generateResultingHero(resultingHero, modifications);
        }
        // test for competitive class upgrade
        // we can't know how many cycles it's been since the "every ranking < 5" condition has been met, so just divide total cycles by 3 to guesstimate but maybe preference play mode
        if (resultingHero.trialRankings.every(r => r.currentRanking <= 5)) {
            for (let i = Math.ceil(cyclesToNextMilestone / 3); i > 0; i--) {
                const averageRanking = resultingHero.trialRankings.reduce((total, r) => total += r.currentRanking, 0) / resultingHero.trialRankings.length;
                const score = Math.round(averageRanking ** 2 * this.gameConfigMgr.competitiveClassGraduationChanceCoefficient);
                if (!randRange(0, score)) {
                    // graduate to next competitive class
                    modifications = this.taskResultGenerator.generateNewCompetitiveClassModifications(resultingHero);
                    resultingHero = this.generateResultingHero(resultingHero, modifications);
                }
            }
        }

        const newTask: Task = {
            description: catchUpTaskDescription,
            durationMs: timeToNextMilestoneMs,
            resultingHero: resultingHero,
            taskStartTime: startingPoint,
        };

        return newTask
    }
}

enum CatchUpMilestones {
    CATCH_UP,
    LEVEL_UP,
    COMPLETE_ADVENTURE,
    ENVIRONMENTAL_LIMIT_BREAK,
}