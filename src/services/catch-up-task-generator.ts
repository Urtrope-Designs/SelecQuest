import { ITaskGenerator, TaskMode } from "../models/task-models";
import { AppState, Task, Hero } from "../models/models";
import { HeroManager } from "./hero-manager";

export class CatchUpTaskGenerator implements ITaskGenerator{

    constructor(
    ) {
    }

    generateNextTask(state: AppState): Task {
        console.log('generating a catch-up task!');
        const nowTime = new Date().getTime();
        const oneWeekAgo = nowTime - (1000 * 60 * 60 * 24 * 7);
        const startingPoint = Math.max((state.activeTask.taskStartTime + state.activeTask.durationMs), oneWeekAgo);
        const totalTimeToCatchUp = nowTime - startingPoint;
        const isEnvironmentalLimitBroken = state.activeTaskMode == TaskMode.LOOT_MODE ? state.hero.lootEnvironmentalLimit >= state.hero.maxLootEnvironmentalLimit
                                            : state.activeTaskMode == TaskMode.TRIAL_MODE ? state.hero.trialEnvironmentalLimit >= state.hero.maxTrialEnvironmentalLimit
                                            : state.hero.questEnvironmentalLimit >= state.hero.maxQuestEnvironmentalLimit;

        let timeToNextMilestone = totalTimeToCatchUp;
        let nearestMilestone = CatchUpMilestones.CATCH_UP;

        const timeToLevelUp = this.determineTimeToLevelUp(state.hero, state.activeTaskMode, isEnvironmentalLimitBroken);
        if (timeToLevelUp < timeToNextMilestone) {
            timeToNextMilestone = timeToLevelUp;
            nearestMilestone = CatchUpMilestones.LEVEL_UP;
        }

        const timeToNextAdventure = this.determineTimeToAdventureComplete(state.hero, state.activeTaskMode, isEnvironmentalLimitBroken);
        if (timeToNextAdventure < timeToNextMilestone) {
            timeToNextMilestone = timeToNextAdventure;
            nearestMilestone = CatchUpMilestones.COMPLETE_ADVENTURE;
        }

        if (!isEnvironmentalLimitBroken) {
            const timeToEnvironmentalLimitBreak = this.determineTimeToEnvironmentalLimitBreak(state.hero, state.activeTaskMode);
            if (timeToEnvironmentalLimitBreak < timeToNextMilestone) {
                timeToNextMilestone = timeToEnvironmentalLimitBreak;
                nearestMilestone = CatchUpMilestones.ENVIRONMENTAL_LIMIT_BREAK;
            }
        }

        // TODO: determine "resultingHero" after that milestone is reached
        console.log('Nearest Milestone: ', nearestMilestone);

        const newTask: Task = {
            description: 'Catchup',
            durationMs: 1000 * timeToNextMilestone,
            resultingHero: state.hero,
            taskStartTime: startingPoint,
        };

        return newTask;
    }

    private determineTimeToLevelUp(hero: Hero, taskMode: TaskMode, isEnvironmentalLimitBroken: boolean): number {
        const buildUpLimit = taskMode == TaskMode.LOOT_MODE ? hero.maxLootBuildUp : taskMode == TaskMode.TRIAL_MODE ? hero.maxTrialBuildUp : hero.maxQuestBuildUp;

        const averageXPEarningTaskLength = 6.5;             // rough average of xp earned per xp-earning task
        const xpGainedPerCycle = Math.ceil(buildUpLimit * averageXPEarningTaskLength / (isEnvironmentalLimitBroken ? 2 : 1));

        const cyclesToNextLevel = Math.ceil(HeroManager.getXpRequiredForNextLevel(hero.level) / xpGainedPerCycle);

        const averageOffXPTasksPerCycle = taskMode == TaskMode.QUEST_MODE ? buildUpLimit : .9 * buildUpLimit;

        const fullCycleDuration = 4 + averageXPEarningTaskLength * buildUpLimit + 4 + averageOffXPTasksPerCycle + 5;

        const timeToLevelUp = cyclesToNextLevel * fullCycleDuration;

        return timeToLevelUp;
    }
    
    private determineTimeToAdventureComplete(hero: Hero, taskMode: TaskMode, isEnvironmentalLimitBroken: boolean): number {
        const buildUpLimit = taskMode == TaskMode.LOOT_MODE ? hero.maxLootBuildUp : taskMode == TaskMode.TRIAL_MODE ? hero.maxTrialBuildUp : hero.maxQuestBuildUp;

        const averageAPEarningTaskLength = 6.5;             // rough average of xp earned per xp-earning task
        const apGainedPerCycle = Math.ceil(buildUpLimit * averageAPEarningTaskLength / (isEnvironmentalLimitBroken ? 2 : 1));

        const cyclesToNextAdventure = Math.ceil(hero.currentAdventure.progressRequired / apGainedPerCycle);

        const averageOffAPTasksPerCycle = taskMode == TaskMode.QUEST_MODE ? buildUpLimit : .9 * buildUpLimit;

        const fullCycleDuration = 4 + averageAPEarningTaskLength * buildUpLimit + 4 + averageOffAPTasksPerCycle + 5;

        const timeToNextAdventure = cyclesToNextAdventure * fullCycleDuration + 3;

        return timeToNextAdventure;
    }

    private determineTimeToEnvironmentalLimitBreak(hero: Hero, taskMode: TaskMode): number {
        const buildUpLimit = taskMode == TaskMode.LOOT_MODE ? hero.maxLootBuildUp : taskMode == TaskMode.TRIAL_MODE ? hero.maxTrialBuildUp : hero.maxQuestBuildUp;
        const advancementUntilLimit = taskMode == TaskMode.LOOT_MODE ? hero.maxLootEnvironmentalLimit - hero.lootEnvironmentalLimit
                                            : taskMode == TaskMode.TRIAL_MODE ? hero.maxTrialEnvironmentalLimit - hero.trialEnvironmentalLimit
                                            : hero.maxQuestEnvironmentalLimit - hero.questEnvironmentalLimit;

        const averageAdvancementTaskLength = 6.5;             // rough average of xp earned per xp-earning task
        const advancementGainedPerCycle = buildUpLimit;

        const cyclesToNextLevel = Math.ceil(advancementUntilLimit / advancementGainedPerCycle);

        const averageOffAdvancementTasksPerCycle = taskMode == TaskMode.QUEST_MODE ? buildUpLimit : .9 * buildUpLimit;

        const fullCycleDuration = 4 + averageAdvancementTaskLength * buildUpLimit + 4 + averageOffAdvancementTasksPerCycle + 5;

        const timeToLevelUp = cyclesToNextLevel * fullCycleDuration;

        return timeToLevelUp;

    }
}

enum CatchUpMilestones {
    CATCH_UP,
    LEVEL_UP,
    COMPLETE_ADVENTURE,
    ENVIRONMENTAL_LIMIT_BREAK,
}