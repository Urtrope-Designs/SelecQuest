import { ITaskGenerator, TaskMode } from "../models/task-models";
import { AppState, Task, Hero } from "../models/models";
import { HeroManager } from "./hero-manager";

export class CatchUpTaskGenerator implements ITaskGenerator{

    constructor(
    ) {
    }

    generateNextTask(state: AppState): Task {
        const nowTime = new Date().getTime();
        const oneWeekAgo = nowTime - (1000 * 60 * 60 * 24 * 7);
        const startingPoint = Math.max((state.activeTask.taskStartTime + state.activeTask.durationMs), oneWeekAgo);
        const totalTimeToCatchUp = nowTime - startingPoint;
        const averageAdvancementTaskLength = 6.5;
        
        const {timeToNextMilestone, nearestMilestone} = this.determineNearestMilestone(state, totalTimeToCatchUp, averageAdvancementTaskLength); 
        
        const newTask = this.buildTaskResults(state, startingPoint, timeToNextMilestone, nearestMilestone);
        
        return newTask;
    }
    
    determineNearestMilestone(state: AppState, totalTimeToCatchUp: number, averageAdvancementTaskLength: number): { timeToNextMilestone: number; nearestMilestone: CatchUpMilestones; } {
        let timeToNextMilestone = totalTimeToCatchUp;
        let nearestMilestone = CatchUpMilestones.CATCH_UP;
        
        const isEnvironmentalLimitBroken = state.activeTaskMode == TaskMode.LOOT_MODE ? state.hero.lootEnvironmentalLimit >= state.hero.maxLootEnvironmentalLimit
        : state.activeTaskMode == TaskMode.TRIAL_MODE ? state.hero.trialEnvironmentalLimit >= state.hero.maxTrialEnvironmentalLimit
        : state.hero.questEnvironmentalLimit >= state.hero.maxQuestEnvironmentalLimit;
        const buildUpLimit = state.activeTaskMode == TaskMode.LOOT_MODE ? state.hero.maxLootBuildUp 
        : state.activeTaskMode == TaskMode.TRIAL_MODE ? state.hero.maxTrialBuildUp 
        : state.hero.maxQuestBuildUp;

        const timeToLevelUp = this.determineTimeToLevelUp(state.hero, state.activeTaskMode, buildUpLimit, averageAdvancementTaskLength, isEnvironmentalLimitBroken);
        if (timeToLevelUp < timeToNextMilestone) {
            timeToNextMilestone = timeToLevelUp;
            nearestMilestone = CatchUpMilestones.LEVEL_UP;
        }
        
        const timeToNextAdventure = this.determineTimeToAdventureComplete(state.hero, state.activeTaskMode, buildUpLimit, averageAdvancementTaskLength, isEnvironmentalLimitBroken);
        if (timeToNextAdventure < timeToNextMilestone) {
            timeToNextMilestone = timeToNextAdventure;
            nearestMilestone = CatchUpMilestones.COMPLETE_ADVENTURE;
        }
        
        if (!isEnvironmentalLimitBroken) {
            const timeToEnvironmentalLimitBreak = this.determineTimeToEnvironmentalLimitBreak(state.hero, state.activeTaskMode, averageAdvancementTaskLength, buildUpLimit);
            if (timeToEnvironmentalLimitBreak < timeToNextMilestone) {
                timeToNextMilestone = timeToEnvironmentalLimitBreak;
                nearestMilestone = CatchUpMilestones.ENVIRONMENTAL_LIMIT_BREAK;
            }
        }
        
        return {timeToNextMilestone: timeToNextMilestone, nearestMilestone: nearestMilestone};
    }
    
    buildTaskResults(state: AppState, startingPoint: number, timeToNextMilestone: number, nearestMilestone: CatchUpMilestones): Task {
                // TODO: determine "resultingHero" after that milestone is reached, including "in situ" build-up rewards
        if (nearestMilestone == CatchUpMilestones.CATCH_UP) {
            return null;
        }



        const newTask: Task = {
            description: 'Catchup',
            durationMs: 1000 * timeToNextMilestone,
            resultingHero: state.hero,
            taskStartTime: startingPoint,
        };

        return newTask
    }

    private determineTimeToLevelUp(hero: Hero, taskMode: TaskMode, buildUpLimit: number, averageAdvancementTaskLength: number, isEnvironmentalLimitBroken: boolean): number {
        const xpGainedPerCycle = Math.ceil(buildUpLimit * averageAdvancementTaskLength / (isEnvironmentalLimitBroken ? 2 : 1));

        const cyclesToNextLevel = Math.ceil(HeroManager.getXpRequiredForNextLevel(hero.level) / xpGainedPerCycle);

        const averageOffXPTasksPerCycle = taskMode == TaskMode.QUEST_MODE ? buildUpLimit : .9 * buildUpLimit;

        const fullCycleDuration = 4 + averageAdvancementTaskLength * buildUpLimit + 4 + averageOffXPTasksPerCycle + 5;

        const timeToLevelUp = cyclesToNextLevel * fullCycleDuration;

        return timeToLevelUp;
    }
    
    private determineTimeToAdventureComplete(hero: Hero, taskMode: TaskMode, buildUpLimit: number, averageAdvancementTaskLength: number, isEnvironmentalLimitBroken: boolean): number {
        const apGainedPerCycle = Math.ceil(buildUpLimit * averageAdvancementTaskLength / (isEnvironmentalLimitBroken ? 2 : 1));

        const cyclesToNextAdventure = Math.ceil(hero.currentAdventure.progressRequired / apGainedPerCycle);

        const averageOffAPTasksPerCycle = taskMode == TaskMode.QUEST_MODE ? buildUpLimit : .9 * buildUpLimit;

        const fullCycleDuration = 4 + averageAdvancementTaskLength * buildUpLimit + 4 + averageOffAPTasksPerCycle + 5;

        const timeToNextAdventure = cyclesToNextAdventure * fullCycleDuration + 3;

        return timeToNextAdventure;
    }

    private determineTimeToEnvironmentalLimitBreak(hero: Hero, taskMode: TaskMode, buildUpLimit: number, averageAdvancementTaskLength: number): number {
        const advancementUntilLimit = taskMode == TaskMode.LOOT_MODE ? hero.maxLootEnvironmentalLimit - hero.lootEnvironmentalLimit
                                            : taskMode == TaskMode.TRIAL_MODE ? hero.maxTrialEnvironmentalLimit - hero.trialEnvironmentalLimit
                                            : hero.maxQuestEnvironmentalLimit - hero.questEnvironmentalLimit;

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