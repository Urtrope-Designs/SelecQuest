import { TaskGenerator, GameTaskGeneratorList, TaskMode } from "../models/task-models";
import { AppState, HeroModification, HeroModificationType, Task, LootingTarget, TaskTargetType, GladiatingTarget, QuestBuildUpReward, LeadType, LeadTarget, TrialBuildUpReward, LootBuildUpReward, Hero } from "../models/models";
import { makeStringIndefinite, randRange, randFromList, randSign, capitalizeInitial, makeVerbGerund, generateRandomName } from "../global/utils";
import { TASK_PREFIX_MINIMAL, TASK_PREFIX_BAD_FIRST, TASK_PREFIX_BAD_SECOND, TASK_PREFIX_MAXIMAL, TASK_PREFIX_GOOD_FIRST, TASK_PREFIX_GOOD_SECOND, TASK_GERUNDS, STANDARD_GLADIATING_TARGETS, STANDARD_LOOTING_TARGETS, STANDARD_LEAD_GATHERING_TARGETS, STANDARD_LEAD_TARGETS, IS_DEBUG } from "../global/config";
import { PlayTaskResultGenerator } from "./play-task-result-generator";
import { HeroManager } from "./hero-manager";
import { GameSettingsManager } from "./game-settings-manager";
import { PrologueTask } from "../models/hero-models";

export class PlayTaskGenerator {

    constructor(
        private taskResultGenerator: PlayTaskResultGenerator,
        private heroMgr: HeroManager,
        private gameSettingsMgr: GameSettingsManager,
        ) {
    }

    public generateNextTask(state: AppState): Task {
        const nextTaskGen = this.selectNextTaskGenerator(state);
        const nextTask = nextTaskGen.generateTask(state);

        return nextTask;
    }

    static determineTaskQuantity(targetLevel: number, taskLevel: number) {
        let quantity = 1;
        if (targetLevel - taskLevel > 10) {
            // target level is too low. multiply...
            quantity = Math.floor((targetLevel + randRange(0, taskLevel - 1)) / Math.max(taskLevel, 1));
            if (quantity < 1) {
                quantity = 1;
            }
        }
        return quantity
    }

    static applyTaskNameModifiers(targetLevel: number, taskTarget: LootingTarget): string {
        let taskName = taskTarget.name;
        const NEEDS_PREFIX_SEPARATOR = taskTarget.type == TaskTargetType.LOCATION || taskTarget.type == TaskTargetType.TRIAL;
    
        if ((targetLevel - taskTarget.level) <= -10) {
            taskName = TASK_PREFIX_MINIMAL[taskTarget.type] + ' ' + taskName;
        } else if ((targetLevel - taskTarget.level) < -5) {
            const firstPrefix = randFromList(TASK_PREFIX_BAD_FIRST[taskTarget.type]);
            const secondPrefix = randFromList(TASK_PREFIX_BAD_SECOND[taskTarget.type]);
            const prefixSeparator = NEEDS_PREFIX_SEPARATOR ? ', ' : ' ';
            taskName = firstPrefix + prefixSeparator + secondPrefix + ' ' + taskName;
        } else if (((targetLevel - taskTarget.level) < 0) && (randRange(0, 1))) {
            taskName = randFromList(TASK_PREFIX_BAD_FIRST[taskTarget.type]) + ' ' + taskName;
        } else if (((targetLevel - taskTarget.level) < 0)) {
            taskName = randFromList(TASK_PREFIX_BAD_SECOND[taskTarget.type]) + ' ' + taskName;
        } else if ((targetLevel - taskTarget.level) >= 10) {
            taskName = TASK_PREFIX_MAXIMAL[taskTarget.type] + ' ' + taskName;
        } else if ((targetLevel - taskTarget.level) > 5) {
            const firstPrefix = randFromList(TASK_PREFIX_GOOD_FIRST[taskTarget.type]);
            const secondPrefix = randFromList(TASK_PREFIX_GOOD_SECOND[taskTarget.type]);
            const prefixSeparator = NEEDS_PREFIX_SEPARATOR ? ', ' : ' ';
            taskName = firstPrefix + prefixSeparator + secondPrefix + ' ' + taskName;
        } else if (((targetLevel - taskTarget.level) > 0) && (randRange(0, 1))) {
            taskName = randFromList(TASK_PREFIX_GOOD_FIRST[taskTarget.type]) + ' ' + taskName;
        } else if (((targetLevel - taskTarget.level) > 0)) {
            taskName = randFromList(TASK_PREFIX_GOOD_SECOND[taskTarget.type]) + ' ' + taskName;
        }
    
        return taskName;
    }

    static randomizeTargetLevel(heroLevel: number): number {
        let targetLevel = heroLevel;
        for (let i = heroLevel; i >= 1; --i) {
            if (randRange(1, 5) <= 2)
                targetLevel += randSign();
            }
        if (targetLevel < 1) {
            targetLevel = 1;
        } 
    
        return targetLevel;
    }

    /** select target with level closest to the targetLevel out of random selection of targets */
    static randomizeTargetFromList(targetLevel: number, targetOptions: LootingTarget[] | GladiatingTarget[], numIterations: number = 6): LootingTarget | GladiatingTarget {
        if (numIterations < 1) {
            numIterations = 1;
        }
        let target = randFromList(targetOptions);
        for (let i = 0; i < numIterations - 1; i++) {
            let newTarget = randFromList(targetOptions);
            if (Math.abs(targetLevel - target.level) < Math.abs(targetLevel - newTarget.level)) {
                target = newTarget;
            }
        }

        return target;
    }

    //logic stolen pretty much directly from PQ
    private generateLootingTaskContentsFromLevel(level: number): {taskName: string, taskLevel: number, lootData: LootBuildUpReward[]} {
        let taskName = '';
        let lootData: LootBuildUpReward[] = [];

        let targetLevel = PlayTaskGenerator.randomizeTargetLevel(level);

        let lootTarget = PlayTaskGenerator.randomizeTargetFromList(targetLevel, STANDARD_LOOTING_TARGETS, 6);

        let quantity = PlayTaskGenerator.determineTaskQuantity(targetLevel, lootTarget.level);

        targetLevel = Math.floor(targetLevel / quantity);
    
        taskName = PlayTaskGenerator.applyTaskNameModifiers(targetLevel, lootTarget);

        taskName = TASK_GERUNDS[lootTarget.type] + ' ' + makeStringIndefinite(taskName, quantity);

        lootData.push({
            name: lootTarget.reward,
            quantity: 1,
            value: 1,
        });

        return {taskName: taskName, taskLevel: targetLevel * quantity, lootData: lootData};
    }

    private generateGladiatingTaskContents(curHero: Hero): {taskName: string, taskLevel: number, trophyData: TrialBuildUpReward[]} {
        const gameSetting = this.gameSettingsMgr.getGameSettingById(curHero.gameSettingId);
        let taskName = '';
        let trophyData: TrialBuildUpReward[] = [];

        let targetLevel = PlayTaskGenerator.randomizeTargetLevel(curHero.level);
        let taskLevel = targetLevel;

        if (randRange(0, 1)) {
            // dueling task
            let foeLevel = PlayTaskGenerator.randomizeTargetLevel(curHero.level);
            let foeRace = randFromList(gameSetting.heroRaces);
            let foeClass = randFromList(gameSetting.heroClasses);
            let quantity = PlayTaskGenerator.determineTaskQuantity(targetLevel, foeLevel);
            if (quantity === 1) {
                let foeName = generateRandomName(gameSetting);
                taskName = `${TASK_GERUNDS[TaskTargetType.DUEL]} ${foeName}, the ${foeRace.raceName} ${foeClass}`;
            }
            else {
                taskName = TASK_GERUNDS[TaskTargetType.DUEL] + ' ' + makeStringIndefinite(`level ${foeLevel} ${foeRace.raceName} ${foeClass}`, quantity);
            }
            taskLevel = foeLevel * quantity;
            
            trophyData.push({
                name: foeRace.raceName + ' ' + foeRace.trophyName,
                quantity: 1,
                value: 1,
            })

        } else {
            // trial task
            let gladiatingTarget;
            gladiatingTarget = PlayTaskGenerator.randomizeTargetFromList(targetLevel, STANDARD_GLADIATING_TARGETS, 6);
            
            let quantity = PlayTaskGenerator.determineTaskQuantity(targetLevel, gladiatingTarget.level);
            targetLevel = Math.floor(targetLevel / quantity);
        
            // todo: need to either fit trials into the mould of this function, or create a new function/modify the old one.
            taskName = PlayTaskGenerator.applyTaskNameModifiers(targetLevel, gladiatingTarget);
        
            taskName = TASK_GERUNDS[gladiatingTarget.type] + ' ' + makeStringIndefinite(taskName, quantity);

            taskLevel = targetLevel * quantity;

            trophyData.push({
                name: capitalizeInitial(gladiatingTarget.reward),
                quantity: 1,
                value: 1,
            });
        }

        return {taskName: taskName, taskLevel: taskLevel, trophyData: trophyData};
    }

    private generateInvestigatingTaskContents(): {taskName: string, leadData: QuestBuildUpReward[]} {
        let investigatingTaskName = '';
        let leadData = [];

        const investigatingTarget = randFromList(STANDARD_LEAD_GATHERING_TARGETS);

        investigatingTaskName = capitalizeInitial(`${investigatingTarget.gerundPhrase} ${randFromList(investigatingTarget.predicateOptions)}`);

        const leadTargetType: LeadType = randFromList(investigatingTarget.leadTypes);
        const leadTarget: LeadTarget = randFromList(STANDARD_LEAD_TARGETS[leadTargetType]);

        const leadPredicate = leadTarget.predicateFactory.apply(null);
        const lead: QuestBuildUpReward = {
            questlogName: capitalizeInitial(`${leadTarget.verb} ${leadPredicate}`),
            taskName: capitalizeInitial(`${makeVerbGerund(leadTarget.verb)} ${leadPredicate}`),
            value: 1,
        }

        leadData.push(lead);

        return {taskName: investigatingTaskName, leadData: leadData};
    }


    static getTradeInCostForLevel(level: number): number {
        return IS_DEBUG ? (10 * level + 4) : (5 * level**2 + 10 * level + 20);
    }

    private generateResultingHero(baseHero: Hero, modifications: HeroModification[]): Hero {
        let updatedHero: Hero = this.heroMgr.applyHeroTaskUpdates(baseHero, modifications);
        if (HeroManager.hasHeroReachedNextLevel(updatedHero)) {
            const levelUpMods = this.taskResultGenerator.generateLevelUpModifications(updatedHero)
            updatedHero = this.heroMgr.applyHeroModifications(updatedHero, levelUpMods, false);
        }
        return updatedHero;
    }

    lootingTaskGen: TaskGenerator = {
        shouldRun: (_state: AppState) => {
            return true;
        },
        generateTask: (state: AppState) => {
            const {taskName, taskLevel, lootData} = this.generateLootingTaskContentsFromLevel(state.hero.level);
            const durationSeconds = Math.floor(6 * taskLevel / state.hero.level);
            const isMarketSaturated = state.hero.lootEnvironmentalLimit >= state.hero.maxLootEnvironmentalLimit;
            const modifications: HeroModification[] = [
                {
                    type: HeroModificationType.ADD_QUANTITY,
                    attributeName: 'lootBuildUpRewards',
                    data: lootData,
                },
                {
                    type: HeroModificationType.DECREASE,
                    attributeName: 'trialEnvironmentalLimit',
                    data: -2,
                },
                {
                    type: HeroModificationType.DECREASE,
                    attributeName: 'questEnvironmentalLimit',
                    data: -2,
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'currentXp',
                    data: (Math.ceil(durationSeconds / (isMarketSaturated ? 2 : 1))),
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'adventureProgress',
                    data: (Math.ceil(durationSeconds / (isMarketSaturated ? 2 : 1))),
                },
            ];

            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: taskName,
                durationMs: durationSeconds * 1000,
                resultingHero: updatedHero
            };
            return newTask;
        },
    };
    
    startLootTearDownTaskGenerator: TaskGenerator = {
        shouldRun: (state: AppState) => {
            if (state.activeTaskMode !== TaskMode.LOOT_MODE) {
                return false;
            }
    
            const currentEncumbrance = state.hero.lootBuildUpRewards.reduce((prevVal, curVal) => {
                return prevVal + curVal.quantity;
            }, 0);
            return currentEncumbrance >= state.hero.maxLootBuildUp;
        },
        generateTask: (state: AppState) => {
            const gameSetting = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId);
            const modifications = [
                {
                    type: HeroModificationType.SET_TEARDOWN_MODE,
                    attributeName: 'isInTeardownMode',
                    data: [{index: TaskMode.LOOT_MODE, value: true}],
                }
            ];
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: randFromList(gameSetting.taskModeData[TaskMode.LOOT_MODE].startTearDownTaskDescriptionOptions),
                durationMs: 4 * 1000,
                resultingHero: updatedHero,
            }
    
            return newTask;
        }
    };
    
    selloffTaskGen: TaskGenerator = {
        shouldRun: (_state: AppState) => {
            return true;
        },
        generateTask: (state: AppState) => {
            const sellItem = state.hero.lootBuildUpRewards[0];
            if (!!sellItem) {
                const isMarketSaturated = state.hero.lootEnvironmentalLimit >= state.hero.maxLootEnvironmentalLimit;
                const sellQuantity = sellItem.quantity;
                const sellValue = Math.ceil((sellQuantity * sellItem.value * state.hero.level) / (isMarketSaturated ? 2 : 1));
                let lootData = [
                    {
                        name: sellItem.name,
                        quantity: -1 * sellQuantity,
                        value: 0
                    }
                ];
                const modifications: HeroModification[] = [
                    {
                        type: HeroModificationType.REMOVE,
                        attributeName: 'lootBuildUpRewards',
                        data: lootData,
                    },
                    {
                        type: HeroModificationType.ADD_CURRENCY,
                        attributeName: 'currency',
                        data: [{index: TaskMode.LOOT_MODE, value: sellValue}],
                    },
                    {
                        type: HeroModificationType.INCREASE,
                        attributeName: 'lootEnvironmentalLimit',
                        data: sellQuantity,
                    },
                ]
                const updatedHero = this.generateResultingHero(state.hero, modifications);
    
                const newTask: Task = {
                    description: 'Selling ' + makeStringIndefinite(sellItem.name, sellItem.quantity),
                    durationMs: 1000,
                    resultingHero: updatedHero,
                }
                return newTask;
            } else {
                const modifications = [
                    {
                        type: HeroModificationType.SET_TEARDOWN_MODE,
                        attributeName: 'isInTeardownMode',
                        data: [{index: TaskMode.LOOT_MODE, value: false}],
                    }
                ];
                const updatedHero = this.generateResultingHero(state.hero, modifications);
                const newTask: Task = {
                    description: 'Cleanup',
                    durationMs: 10,
                    resultingHero: updatedHero,
                }
                return newTask;
            }
        }
    };
    
    startLootBuildUpTaskGenerator: TaskGenerator = {
        shouldRun: (state: AppState) => {
            const currentEncumbrance = state.hero.lootBuildUpRewards.reduce((prevVal, curVal) => {
                return prevVal + curVal.quantity;
            }, 0);
            return currentEncumbrance <= 0;
        },
        generateTask: (state: AppState) => {
            const gameSetting = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId);
            const modifications = [
                {
                    type: HeroModificationType.SET_TEARDOWN_MODE,
                    attributeName: 'isInTeardownMode',
                    data: [{index: TaskMode.LOOT_MODE, value: false}],
                }
            ];
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: randFromList(gameSetting.taskModeData[TaskMode.LOOT_MODE].startBuildUpTaskDescriptionOptions),
                durationMs: 4 * 1000,
                resultingHero: updatedHero
            }
    
            return newTask;
        },
    };
    
    purchaseLootMajorRewardTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            const currentEncumbrance = state.hero.lootBuildUpRewards.reduce((prevVal, curVal) => {
                return prevVal + curVal.quantity;
            }, 0);
            const minGold = PlayTaskGenerator.getTradeInCostForLevel(state.hero.level);
            return currentEncumbrance <= 0 && (state.hero.currency[TaskMode.LOOT_MODE] - state.hero.spentCurrency[TaskMode.LOOT_MODE]) >= minGold;
        },
        generateTask: (state: AppState) => {
            const gameSetting = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId);
            const newLootMajorRewardMod = this.taskResultGenerator.generateNewLootMajorRewardModification(state.hero);
            const modifications = [
                newLootMajorRewardMod,
                {
                    type: HeroModificationType.ADD_CURRENCY,
                    attributeName: 'spentCurrency',
                    data: [{index: TaskMode.LOOT_MODE, value: PlayTaskGenerator.getTradeInCostForLevel(state.hero.level)}],
                },
            ];
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: randFromList(gameSetting.taskModeData[TaskMode.LOOT_MODE].earnMajorRewardTaskDescriptionOptions),
                durationMs: 5 * 1000,
                resultingHero: updatedHero, 
            }
            return newTask;
        },
    };
    
    gladiatingTaskGen: TaskGenerator = {
        shouldRun: (_state: AppState) => {
            return true;
        },
        generateTask: (state: AppState) => {
            const {taskName, taskLevel, trophyData} = this.generateGladiatingTaskContents(state.hero);
            const durationSeconds = Math.floor(6 * taskLevel / state.hero.level);
            const isFatigued = state.hero.trialEnvironmentalLimit >= state.hero.maxTrialEnvironmentalLimit;
            const modifications: HeroModification[] = [
                {
                    type: HeroModificationType.ADD_QUANTITY,
                    attributeName: 'trialBuildUpRewards',
                    data: trophyData,
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'trialEnvironmentalLimit',
                    data: 1,
                },
                {
                    type: HeroModificationType.DECREASE,
                    attributeName: 'lootEnvironmentalLimit',
                    data: -2,
                },
                {
                    type: HeroModificationType.DECREASE,
                    attributeName: 'questEnvironmentalLimit',
                    data: -2,
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'currentXp',
                    data: (Math.ceil(durationSeconds / (isFatigued ? 2 : 1))),
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'adventureProgress',
                    data: (Math.ceil(durationSeconds / (isFatigued ? 2 : 1))),
                },
            ]
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: taskName,
                durationMs: durationSeconds * 1000,
                resultingHero: updatedHero,
            };
            return newTask;
        }
    };
    
    startTrialTearDownTaskGenerator: TaskGenerator = {
        shouldRun: (state: AppState) => {
            if (state.activeTaskMode !== TaskMode.TRIAL_MODE) {
                return false;
            }
    
            const currentTrialBuildUp = state.hero.trialBuildUpRewards.reduce((prevVal, curVal) => {
                return prevVal + curVal.quantity;
            }, 0);
            return currentTrialBuildUp >= state.hero.maxTrialBuildUp;
        },
        generateTask: (state: AppState) => {
            const gameSetting = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId);
            const modifications = [
                {
                    type: HeroModificationType.SET_TEARDOWN_MODE,
                    attributeName: 'isInTeardownMode',
                    data: [{index: TaskMode.TRIAL_MODE, value: true}],
                }
            ];
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: randFromList(gameSetting.taskModeData[TaskMode.TRIAL_MODE].startTearDownTaskDescriptionOptions),
                durationMs: 4 * 1000,
                resultingHero: updatedHero,
            }
    
            return newTask;
        }
    };
    
    boastingTaskGen: TaskGenerator = {
        shouldRun: (_state: AppState) => {
            return true;
        },
        generateTask: (state: AppState) => {
            const boastItem = state.hero.trialBuildUpRewards[0];
            if (!!boastItem) {
                const isFatigued = state.hero.trialEnvironmentalLimit >= state.hero.maxTrialEnvironmentalLimit;
                const boastQuantity = boastItem.quantity;
                const renownValue = Math.ceil((boastQuantity * boastItem.value * state.hero.level) / (isFatigued ? 2 : 1));
                let trialBuildUpRewards = [
                    {
                        name: boastItem.name,
                        quantity: -1 * boastQuantity,
                        value: 0
                    }
                ];
                const modifications: HeroModification[] = [
                    {
                        type: HeroModificationType.REMOVE,
                        attributeName: 'trialBuildUpRewards',
                        data: trialBuildUpRewards,
                    },
                    {
                        type: HeroModificationType.ADD_CURRENCY,
                        attributeName: 'currency',
                        data: [{index: TaskMode.TRIAL_MODE, value: renownValue}],
                    },
                ];
                const updatedHero = this.generateResultingHero(state.hero, modifications);
                
                const newTask: Task = {
                    description: 'Boasting of ' + makeStringIndefinite(boastItem.name, boastQuantity),
                    durationMs: 1000,
                    resultingHero: updatedHero,
                }
                return newTask;
            } else {
                const modifications = [
                    {
                        type: HeroModificationType.SET_TEARDOWN_MODE,
                        attributeName: 'isInTeardownMode',
                        data: [{index: TaskMode.TRIAL_MODE, value: false}],
                    },
                ];
                const updatedHero = this.generateResultingHero(state.hero, modifications);
                const newTask: Task = {
                    description: 'Cleanup',
                    durationMs: 10,
                    resultingHero: updatedHero,
                }
                return newTask;
            }
        }
    };
    
    startTrialBuildUpTaskGenerator: TaskGenerator = {
        shouldRun: (state: AppState) => {
            const currentTrialBuildUp = state.hero.trialBuildUpRewards.reduce((prevVal, curVal) => {
                return prevVal + curVal.quantity;
            }, 0);
            return currentTrialBuildUp <= 0;
        },
        generateTask: (state: AppState) => {
            const gameSetting = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId);
            const modifications = [
                {
                    type: HeroModificationType.SET_TEARDOWN_MODE,
                    attributeName: 'isInTeardownMode',
                    data: [{index: TaskMode.TRIAL_MODE, value: false}],
                }
            ];
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: randFromList(gameSetting.taskModeData[TaskMode.TRIAL_MODE].startBuildUpTaskDescriptionOptions),
                durationMs: 4 * 1000,
                resultingHero: updatedHero,
            };
    
            return newTask;
        }
    };
    
    earnTrialMajorRewardTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            const currentTrialBuildUp = state.hero.trialBuildUpRewards.reduce((prevVal, curVal) => {
                return prevVal + curVal.quantity;
            }, 0);
            return currentTrialBuildUp <= 0 && (state.hero.currency[TaskMode.TRIAL_MODE] - state.hero.spentCurrency[TaskMode.TRIAL_MODE]) >= PlayTaskGenerator.getTradeInCostForLevel(state.hero.level);
        },
        generateTask: (state: AppState) => {
            const gameSetting = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId);
            const newTrialMajorRewardMod = this.taskResultGenerator.generateNewTrialMajorRewardModification(state.hero);
            const modifications = [
                newTrialMajorRewardMod,
                {
                    type: HeroModificationType.ADD_CURRENCY,
                    attributeName: 'spentCurrency',
                    data: [{index: TaskMode.TRIAL_MODE, value: PlayTaskGenerator.getTradeInCostForLevel(state.hero.level)}],
                },
            ];
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: randFromList(gameSetting.taskModeData[TaskMode.TRIAL_MODE].earnMajorRewardTaskDescriptionOptions),
                durationMs: 5 * 1000,
                resultingHero: updatedHero,
            };
            return newTask;
        },
    };
    
    investigatingTaskGen: TaskGenerator = {
        shouldRun: (_state: AppState) => {
            return true;
        },
        generateTask: (state: AppState) => {
            const {taskName, leadData} = this.generateInvestigatingTaskContents();
            const durationSeconds = 1;
    
            const modifications: HeroModification[] = [
                {
                    type: HeroModificationType.ADD,
                    attributeName: 'questBuildUpRewards',
                    data: leadData,
                },
            ];
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            
            const newTask: Task = {
                description: taskName,
                durationMs: durationSeconds * 1000,
                resultingHero: updatedHero,
            };
            return newTask;
        }
    };
    
    startQuestTearDownTaskGenerator: TaskGenerator = {
        shouldRun: (state: AppState) => {
            if (state.activeTaskMode !== TaskMode.QUEST_MODE) {
                return false;
            }
    
            return state.hero.questBuildUpRewards.length >= state.hero.maxQuestBuildUp;
        },
        generateTask: (state: AppState) => {
            const gameSetting = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId);
            const modifications = [
                {
                    type: HeroModificationType.SET_TEARDOWN_MODE,
                    attributeName: 'isInTeardownMode',
                    data: [{index: TaskMode.QUEST_MODE, value: true}],
                }
            ];
            const updatedHero = this.generateResultingHero(state.hero, modifications);

            const newTask: Task = {
                description: randFromList(gameSetting.taskModeData[TaskMode.QUEST_MODE].startTearDownTaskDescriptionOptions),
                durationMs: 4 * 1000,
                resultingHero: updatedHero,
            };
    
            return newTask;
        }
    };
    
    leadFollowingTaskGen: TaskGenerator = {
        shouldRun: (_state: AppState) => {
            return true;
        },
        generateTask: (state: AppState) => {
            const leadToFollow = state.hero.questBuildUpRewards[0];
            if (!!leadToFollow) {
                const isOverexposed = state.hero.questEnvironmentalLimit >= state.hero.maxQuestEnvironmentalLimit;
                const reputationValue = Math.ceil((leadToFollow.value * state.hero.level) / (isOverexposed ? 2 : 1));
                const durationSeconds = randRange(5, 8);
                const modifications: HeroModification[] = [
                    {
                        type: HeroModificationType.REMOVE,
                        attributeName: 'questBuildUpRewards',
                        data: [leadToFollow],
                    },
                    {
                        type: HeroModificationType.ADD_CURRENCY,
                        attributeName: 'currency',
                        data: [{index: TaskMode.QUEST_MODE, value: reputationValue}],
                    },
                    {
                        type: HeroModificationType.INCREASE,
                        attributeName: 'questEnvironmentalLimit',
                        data: 1,
                    },
                    {
                        type: HeroModificationType.DECREASE,
                        attributeName: 'lootEnvironmentalLimit',
                        data: -2,
                    },
                    {
                        type: HeroModificationType.DECREASE,
                        attributeName: 'trialEnvironmentalLimit',
                        data: -2,
                    },
                    {
                        type: HeroModificationType.INCREASE,
                        attributeName: 'currentXp',
                        data: (Math.ceil(durationSeconds / (isOverexposed ? 2 : 1))),
                    },
                    {
                        type: HeroModificationType.INCREASE,
                        attributeName: 'adventureProgress',
                        data: (Math.ceil(durationSeconds / (isOverexposed ? 2 : 1))),
                    },
                ];
                const updatedHero = this.generateResultingHero(state.hero, modifications);
                
                const newTask: Task = {
                    description: leadToFollow.taskName,
                    durationMs: durationSeconds * 1000,
                    resultingHero: updatedHero,
                };
                return newTask;
            } else {
                const modifications = [
                    {
                        type: HeroModificationType.SET_TEARDOWN_MODE,
                        attributeName: 'isInTeardownMode',
                        data: [{index: TaskMode.QUEST_MODE, value: false}],
                    },
                ];
                const updatedHero = this.generateResultingHero(state.hero, modifications);
                const newTask: Task = {
                    description: 'Cleanup',
                    durationMs: 10,
                    resultingHero: updatedHero,
                }
                return newTask;
            }
        }
    };
    
    startQuestBuildUpTaskGenerator: TaskGenerator = {
        shouldRun: (state: AppState) => {
            return state.hero.questBuildUpRewards.length <= 0;
        },
        generateTask: (state: AppState) => {
            const gameSetting = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId);
            const modifications = [
                {
                    type: HeroModificationType.SET_TEARDOWN_MODE,
                    attributeName: 'isInTeardownMode',
                    data: [{index: TaskMode.QUEST_MODE, value: false}],
                }
            ];
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: randFromList(gameSetting.taskModeData[TaskMode.QUEST_MODE].startBuildUpTaskDescriptionOptions),
                durationMs: 4 * 1000,
                resultingHero: updatedHero,
            };
    
            return newTask;
        }
    };
    
    gainQuestMajorRewardTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            return state.hero.questBuildUpRewards.length <= 0 && (state.hero.currency[TaskMode.QUEST_MODE] - state.hero.spentCurrency[TaskMode.QUEST_MODE]) >= PlayTaskGenerator.getTradeInCostForLevel(state.hero.level);
        },
        generateTask: (state: AppState) => {
            const gameSetting = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId);
            const newQuestMajorRewardMod = this.taskResultGenerator.generateNewQuestMajorRewardModification(state.hero);
            const modifications = [
                newQuestMajorRewardMod,
                {
                    type: HeroModificationType.ADD_CURRENCY,
                    attributeName: 'spentCurrency',
                    data: [{index: TaskMode.QUEST_MODE, value: PlayTaskGenerator.getTradeInCostForLevel(state.hero.level)}],
                },
            ];
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: randFromList(gameSetting.taskModeData[TaskMode.QUEST_MODE].earnMajorRewardTaskDescriptionOptions),
                durationMs: 5 * 1000,
                resultingHero: updatedHero,
            };
            return newTask;
        },
    };
    
    prologueTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            return state.hero.currentAdventure.name == this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId).prologueAdventureName;
        },
        generateTask: (state: AppState) => {
            let progressInc: number = 0;
            const prologueTasks = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId).prologueTasks;
            const curPrologueTask = prologueTasks.find((t: PrologueTask) => {
                const isCurTask = state.hero.adventureProgress <= progressInc;
                progressInc += t.durationSeconds;
                return isCurTask;
            });
            const modifications = [
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'adventureProgress',
                    data: curPrologueTask.durationSeconds,
                },
            ];
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: curPrologueTask.taskDescription,
                durationMs: curPrologueTask.durationSeconds * 1000,
                resultingHero: updatedHero,
            };
            return newTask;
        },
    }
    
    prologueTransitionTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            const prologueAdventureName = this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId).prologueAdventureName;
            return (state.hero.currentAdventure.name == prologueAdventureName && state.hero.adventureProgress >= state.hero.currentAdventure.progressRequired);
        },
        generateTask: (state: AppState) => {
            const modifications = this.taskResultGenerator.generateNewAdventureResults(state.hero, false);
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const newTask: Task = {
                description: 'Loading',
                durationMs: 20,
                resultingHero: updatedHero,
            };
            return newTask;
        }
    }
    
    
    adventureTransitionTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            return (state.hero.adventureProgress >= state.hero.currentAdventure.progressRequired);
        },
        generateTask: (state: AppState) => {
            const modifications = this.taskResultGenerator.generateNewAdventureResults(state.hero);
            const updatedHero = this.generateResultingHero(state.hero, modifications);
            const taskDescription = randFromList(this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId).adventureTransitionTaskDescriptions);
            const newTask: Task = {
                description: taskDescription,
                durationMs: randRange(2, 3) * 1000,
                resultingHero: updatedHero,
            };
            return newTask;
        }
    };
    
    private prioritizedTaskGenerators: GameTaskGeneratorList = {
        coreTaskGenerators: [
            this.prologueTransitionTaskGen,
            this.prologueTaskGen,
            this.adventureTransitionTaskGen,
        ],
        adventuringModeTaskGenerators: [
            [           // Adventuring Mode 0
                [       // teardownMode[0] == false
                    this.startLootTearDownTaskGenerator,
                    this.lootingTaskGen,
                ],
                [       // teardownMode[0] == true
                    this.purchaseLootMajorRewardTaskGen,
                    this.startLootBuildUpTaskGenerator,
                    this.selloffTaskGen,
                ],
            ],
            [           // Adventuring Mode 1
                [       // teardownMode[1] == false
                    this.startTrialTearDownTaskGenerator,
                    this.gladiatingTaskGen,
                ],
                [       // teardownMode[1] == true
                    this.earnTrialMajorRewardTaskGen,
                    this.startTrialBuildUpTaskGenerator,
                    this.boastingTaskGen,
                ],
            ],
            [           // Adventuring Mode 2
                [       // teardownMode[2] == false
                    this.startQuestTearDownTaskGenerator,
                    this.investigatingTaskGen,
                ],
                [       // teardownMode[2] == true
                    this.gainQuestMajorRewardTaskGen,
                    this.startQuestBuildUpTaskGenerator,
                    this.leadFollowingTaskGen,
                ]
            ]
        ]
    }
    
    private selectNextTaskGenerator(state: AppState): TaskGenerator {
        let nextTaskGenerator: TaskGenerator;
        nextTaskGenerator = this.prioritizedTaskGenerators.coreTaskGenerators.find(taskGen => taskGen.shouldRun(state));
    
        if (!nextTaskGenerator) {
            const taskGeneratorsForState = this.prioritizedTaskGenerators.adventuringModeTaskGenerators[state.activeTaskMode][+state.hero.isInTeardownMode[state.activeTaskMode]];
            nextTaskGenerator = taskGeneratorsForState.find(taskGen => taskGen.shouldRun(state));
        }
    
        return nextTaskGenerator;
    }
}