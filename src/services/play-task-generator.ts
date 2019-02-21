import { TaskGenerator, GameTaskGeneratorList } from "../models/task-models";
import { AppState, HeroModification, HeroModificationType, TaskMode, Task } from "../models/models";
import { GameSetting } from "../global/game-setting";
import { generateLootingTaskContentsFromLevel, getTradeInCostForLevel, generateGladiatingTaskContentsFromLevel, generateInvestigatingTaskContents } from "../global/play-task-helper";
import { makeStringIndefinite, randRange, randFromList } from "../global/utils";
import { generateNewEquipmentModification, generateNewAccoladeModification, generateNewAffiliationModification, generateNewAdventureResults } from "./hero-manager";
import { LEAD_GATHERING_TASK_MODIFIERS } from "../global/config";
import { PROLOGUE_TASKS, PROLOGUE_ADVENTURE_NAME } from "../global/storyline-helpers";
import { GameSettingsManager } from "./game-settings-manager";

export class PlayTaskGenerator {

    constructor(private gameSettingsMgr: GameSettingsManager) {

    }

    lootingTaskGen: TaskGenerator = {
        shouldRun: (_state: AppState) => {
            return true;
        },
        generateTask: (state: AppState, _gameSetting: GameSetting) => {
            const {taskName, taskLevel, lootData} = generateLootingTaskContentsFromLevel(state.hero.level);
            const durationSeconds = Math.floor(6 * taskLevel / state.hero.level);
            const isMarketSaturated = state.hero.marketSaturation >= state.hero.maxMarketSaturation;
            const results: HeroModification[] = [
                {
                    type: HeroModificationType.ADD_QUANTITY,
                    attributeName: 'loot',
                    data: lootData,
                },
                {
                    type: HeroModificationType.DECREASE,
                    attributeName: 'fatigue',
                    data: -2,
                },
                {
                    type: HeroModificationType.DECREASE,
                    attributeName: 'socialExposure',
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
            ]
            const newTask = {
                description: taskName,
                durationMs: durationSeconds * 1000,
                results: results
            };
            return newTask;
        },
    };
    
    triggerSelloffTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            if (state.activeTaskMode !== TaskMode.LOOTING) {
                return false;
            }
    
            const currentEncumbrance = state.hero.loot.reduce((prevVal, curVal) => {
                return prevVal + curVal.quantity;
            }, 0);
            return currentEncumbrance >= state.hero.maxEncumbrance;
        },
        generateTask: (_state: AppState, _gameSetting: GameSetting) => {
            const newTask: Task = {
                description: 'Heading to market to pawn your loot',
                durationMs: 4 * 1000,
                results: [
                    {
                        type: HeroModificationType.SET_TEARDOWN_MODE,
                        attributeName: 'isInTeardownMode',
                        data: [{index: TaskMode.LOOTING, value: true}],
                    }
                ]
            }
    
            return newTask;
        }
    };
    
    selloffTaskGen: TaskGenerator = {
        shouldRun: (_state: AppState) => {
            return true;
        },
        generateTask: (state: AppState, _gameSetting: GameSetting) => {
            const sellItem = state.hero.loot[0];
            if (!!sellItem) {
                const isMarketSaturated = state.hero.marketSaturation >= state.hero.maxMarketSaturation;
                const sellQuantity = sellItem.quantity;
                const sellValue = Math.ceil((sellQuantity * sellItem.value * state.hero.level) / (isMarketSaturated ? 2 : 1));
                let lootData = [
                    {
                        name: sellItem.name,
                        quantity: -1 * sellQuantity,
                        value: 0
                    }
                ];
                const results: HeroModification[] = [
                    {
                        type: HeroModificationType.REMOVE,
                        attributeName: 'loot',
                        data: lootData,
                    },
                    {
                        type: HeroModificationType.INCREASE,
                        attributeName: 'gold',
                        data: sellValue,
                    },
                    {
                        type: HeroModificationType.INCREASE,
                        attributeName: 'marketSaturation',
                        data: sellQuantity,
                    },
                ]
    
                const newTask = {
                    description: 'Selling ' + makeStringIndefinite(sellItem.name, sellItem.quantity),
                    durationMs: 1000,
                    results: results,
                }
                return newTask;
            } else {
                const newTask = {
                    description: 'Cleanup',
                    durationMs: 10,
                    results: [
                        {
                            type: HeroModificationType.SET_TEARDOWN_MODE,
                            attributeName: 'isInTeardownMode',
                            data: [{index: TaskMode.LOOTING, value: false}],
                        }
                    ],
                }
                return newTask;
            }
        }
    };
    
    endSelloffTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            const currentEncumbrance = state.hero.loot.reduce((prevVal, curVal) => {
                return prevVal + curVal.quantity;
            }, 0);
            return currentEncumbrance <= 0;
        },
        generateTask: (_state: AppState, _gameSetting: GameSetting) => {
            const newTask: Task = {
                description: 'Heading out to find some swag',
                durationMs: 4 * 1000,
                results: [
                    {
                        type: HeroModificationType.SET_TEARDOWN_MODE,
                        attributeName: 'isInTeardownMode',
                        data: [{index: TaskMode.LOOTING, value: false}],
                    }
                ]
            }
    
            return newTask;
        },
    };
    
    purchaseEquipmentTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            const currentEncumbrance = state.hero.loot.reduce((prevVal, curVal) => {
                return prevVal + curVal.quantity;
            }, 0);
            const minGold = getTradeInCostForLevel(state.hero.level);
            return currentEncumbrance <= 0 && state.hero.gold >= minGold;
        },
        generateTask: (state: AppState, _gameSetting: GameSetting) => {
            const newEquipmentMod = generateNewEquipmentModification(state.hero, this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId));
            const newTask: Task = {
                description: 'Negotiating the purchase of better equipment',
                durationMs: 5 * 1000,
                results: [
                    newEquipmentMod,
                    {
                        type: HeroModificationType.DECREASE,
                        attributeName: 'gold',
                        data: -getTradeInCostForLevel(state.hero.level),
                    },
                ]
            }
            return newTask;
        },
    };
    
    gladiatingTaskGen: TaskGenerator = {
        shouldRun: (_state: AppState) => {
            return true;
        },
        generateTask: (state: AppState, _gameSetting: GameSetting) => {
            const {taskName, taskLevel, trophyData} = generateGladiatingTaskContentsFromLevel(state.hero.level);
            const durationSeconds = Math.floor(6 * taskLevel / state.hero.level);
            const isFatigued = state.hero.fatigue >= state.hero.maxFatigue;
            const results: HeroModification[] = [
                {
                    type: HeroModificationType.ADD_QUANTITY,
                    attributeName: 'trophies',
                    data: trophyData,
                },
                {
                    type: HeroModificationType.INCREASE,
                    attributeName: 'fatigue',
                    data: 1,
                },
                {
                    type: HeroModificationType.DECREASE,
                    attributeName: 'marketSaturation',
                    data: -2,
                },
                {
                    type: HeroModificationType.DECREASE,
                    attributeName: 'socialExposure',
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
    
            const newTask = {
                description: taskName,
                durationMs: durationSeconds * 1000,
                results: results
            };
            return newTask;
        }
    };
    
    triggerBoastingTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            if (state.activeTaskMode !== TaskMode.GLADIATING) {
                return false;
            }
    
            const currentEquipmentWear = state.hero.trophies.reduce((prevVal, curVal) => {
                return prevVal + curVal.quantity;
            }, 0);
            return currentEquipmentWear >= state.hero.maxEquipmentWear;
        },
        generateTask: (_state: AppState, _gameSetting: GameSetting) => {
            const newTask: Task = {
                description: 'Heading to the nearest inn to boast of your recent deeds while your armor is repaired',
                durationMs: 4 * 1000,
                results: [
                    {
                        type: HeroModificationType.SET_TEARDOWN_MODE,
                        attributeName: 'isInTeardownMode',
                        data: [{index: TaskMode.GLADIATING, value: true}],
                    }
                ]
            }
    
            return newTask;
        }
    };
    
    boastingTaskGen: TaskGenerator = {
        shouldRun: (_state: AppState) => {
            return true;
        },
        generateTask: (state: AppState, _gameSetting: GameSetting) => {
            const boastItem = state.hero.trophies[0];
            if (!!boastItem) {
                const isFatigued = state.hero.fatigue >= state.hero.maxFatigue;
                const boastQuantity = boastItem.quantity;
                const renownValue = Math.ceil((boastQuantity * boastItem.value * state.hero.level) / (isFatigued ? 2 : 1));
                let trophies = [
                    {
                        name: boastItem.name,
                        quantity: -1 * boastQuantity,
                        value: 0
                    }
                ];
                const results: HeroModification[] = [
                    {
                        type: HeroModificationType.REMOVE,
                        attributeName: 'trophies',
                        data: trophies,
                    },
                    {
                        type: HeroModificationType.INCREASE,
                        attributeName: 'renown',
                        data: renownValue,
                    },
                ]
                
                const newTask = {
                    description: 'Boasting of ' + makeStringIndefinite(boastItem.name, boastQuantity),
                    durationMs: 1000,
                    results: results,
                }
                return newTask;
            } else {
                const newTask = {
                    description: 'Cleanup',
                    durationMs: 10,
                    results: [
                        {
                            type: HeroModificationType.SET_TEARDOWN_MODE,
                            attributeName: 'isInTeardownMode',
                            data: [{index: TaskMode.GLADIATING, value: false}],
                        },
                    ],
                }
                return newTask;
            }
        }
    };
    
    endBoastingTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            const currentEquipmentIntegrity = state.hero.trophies.reduce((prevVal, curVal) => {
                return prevVal + curVal.quantity;
            }, 0);
            return currentEquipmentIntegrity <= 0;
        },
        generateTask: (_state: AppState, _gameSetting: GameSetting) => {
            const newTask: Task = {
                description: 'Heading off in search of glory',
                durationMs: 4 * 1000,
                results: [
                    {
                        type: HeroModificationType.SET_TEARDOWN_MODE,
                        attributeName: 'isInTeardownMode',
                        data: [{index: TaskMode.GLADIATING, value: false}],
                    }
                ]
            }
    
            return newTask;
        }
    };
    
    earnAccoladeTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            const currentEquipmentIntegrity = state.hero.trophies.reduce((prevVal, curVal) => {
                return prevVal + curVal.quantity;
            }, 0);
            return currentEquipmentIntegrity <= 0 && (state.hero.renown - state.hero.spentRenown) >= getTradeInCostForLevel(state.hero.level);
        },
        generateTask: (state: AppState, _gameSetting: GameSetting) => {
            const newAccoladeMod = generateNewAccoladeModification(state.hero);
            const newTask: Task = {
                description: 'Being honored for your glorious achievements',
                durationMs: 5 * 1000,
                results: [
                    newAccoladeMod,
                    {
                        type: HeroModificationType.INCREASE,
                        attributeName: 'spentRenown',
                        data: getTradeInCostForLevel(state.hero.level),
                    },
                ]
            }
            return newTask;
        },
    };
    
    investigatingTaskGen: TaskGenerator = {
        shouldRun: (_state: AppState) => {
            return true;
        },
        generateTask: (_state: AppState, _gameSetting: GameSetting) => {
            const {taskName, leadData} = generateInvestigatingTaskContents();
            const durationSeconds = 1;
    
            const results: HeroModification[] = [
                {
                    type: HeroModificationType.ADD,
                    attributeName: 'leads',
                    data: leadData,
                },
            ]
            
            const newTask = {
                description: taskName,
                durationMs: durationSeconds * 1000,
                results: results
            };
            return newTask;
        }
    };
    
    triggerLeadFollowingTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            if (state.activeTaskMode !== TaskMode.INVESTIGATING) {
                return false;
            }
    
            return state.hero.leads.length >= state.hero.maxQuestLogSize;
        },
        generateTask: (_state: AppState, _gameSetting: GameSetting) => {
            const newTask: Task = {
                description: 'Organizing your Questlog',
                durationMs: 4 * 1000,
                results: [
                    {
                        type: HeroModificationType.SET_TEARDOWN_MODE,
                        attributeName: 'isInTeardownMode',
                        data: [{index: TaskMode.INVESTIGATING, value: true}],
                    }
                ]
            }
    
            return newTask;
        }
    };
    
    leadFollowingTaskGen: TaskGenerator = {
        shouldRun: (_state: AppState) => {
            return true;
        },
        generateTask: (state: AppState, _gameSetting: GameSetting) => {
            const leadToFollow = state.hero.leads[0];
            if (!!leadToFollow) {
                const isOverexposed = state.hero.socialExposure >= state.hero.maxSocialCapital;
                const reputationValue = Math.ceil((leadToFollow.value * state.hero.level) / (isOverexposed ? 2 : 1));
                const durationSeconds = randRange(5, 8);
                const results: HeroModification[] = [
                    {
                        type: HeroModificationType.REMOVE,
                        attributeName: 'leads',
                        data: [leadToFollow],
                    },
                    {
                        type: HeroModificationType.INCREASE,
                        attributeName: 'reputation',
                        data: reputationValue,
                    },
                    {
                        type: HeroModificationType.INCREASE,
                        attributeName: 'socialExposure',
                        data: 1,
                    },
                    {
                        type: HeroModificationType.DECREASE,
                        attributeName: 'marketSaturation',
                        data: -2,
                    },
                    {
                        type: HeroModificationType.DECREASE,
                        attributeName: 'fatigue',
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
                ]
                
                const newTask = {
                    description: leadToFollow.taskName,
                    durationMs: durationSeconds * 1000,
                    results: results,
                }
                return newTask;
            } else {
                const newTask = {
                    description: 'Cleanup',
                    durationMs: 10,
                    results: [
                        {
                            type: HeroModificationType.SET_TEARDOWN_MODE,
                            attributeName: 'isInTeardownMode',
                            data: [{index: TaskMode.INVESTIGATING, value: false}],
                        },
                    ],
                }
                return newTask;
            }
        }
    };
    
    endLeadFollowingTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            return state.hero.leads.length <= 0;
        },
        generateTask: (_state: AppState, _gameSetting: GameSetting) => {
            const newTask: Task = {
                description: `Rooting out some ${randFromList(LEAD_GATHERING_TASK_MODIFIERS)} leads`,
                durationMs: 4 * 1000,
                results: [
                    {
                        type: HeroModificationType.SET_TEARDOWN_MODE,
                        attributeName: 'isInTeardownMode',
                        data: [{index: TaskMode.INVESTIGATING, value: false}],
                    }
                ]
            }
    
            return newTask;
        }
    };
    
    gainAffiliationTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            return state.hero.leads.length <= 0 && (state.hero.reputation - state.hero.spentReputation) >= getTradeInCostForLevel(state.hero.level);
        },
        generateTask: (state: AppState, _gameSetting: GameSetting) => {
            const newAffiliationMod = generateNewAffiliationModification(state.hero);
            const newTask: Task = {
                description: 'Solidifying a new connection',
                durationMs: 5 * 1000,
                results: [
                    newAffiliationMod,
                    {
                        type: HeroModificationType.INCREASE,
                        attributeName: 'spentReputation',
                        data: getTradeInCostForLevel(state.hero.level),
                    },
                ]
            }
            return newTask;
        },
    };
    
    private prologueInc = 0;
    prologueTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            return state.hero.currentAdventure.name == PROLOGUE_ADVENTURE_NAME;
        },
        generateTask: (_state: AppState, _gameSetting: GameSetting) => {
            const curPrologueTask = PROLOGUE_TASKS[this.prologueInc];
            this.prologueInc += 1;
            this.prologueInc = Math.min(this.prologueInc, PROLOGUE_TASKS.length-1);
            const newTask: Task = {
                description: curPrologueTask.taskDescription,
                durationMs: curPrologueTask.durationSeconds * 1000,
                results: [
                    {
                        type: HeroModificationType.INCREASE,
                        attributeName: 'adventureProgress',
                        data: curPrologueTask.durationSeconds,
                    },
                ],
            };
            return newTask;
        },
    }
    
    prologueTransitionTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            return (state.hero.currentAdventure.name == PROLOGUE_ADVENTURE_NAME && state.hero.adventureProgress >= state.hero.currentAdventure.progressRequired);
        },
        generateTask: (state: AppState, _gameSetting: GameSetting) => {
            const newTask: Task = {
                description: 'Loading',
                durationMs: 20,
                results: generateNewAdventureResults(state.hero, this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId), false),
            };
            return newTask;
        }
    }
    
    
    adventureTransitionTaskGen: TaskGenerator = {
        shouldRun: (state: AppState) => {
            return (state.hero.adventureProgress >= state.hero.currentAdventure.progressRequired);
        },
        generateTask: (state: AppState, _gameSetting: GameSetting) => {
            const newTask: Task = {
                description: 'Experiencing an enigmatic and foreboding night vision',
                durationMs: randRange(2, 3) * 1000,
                results: generateNewAdventureResults(state.hero, this.gameSettingsMgr.getGameSettingById(state.hero.gameSettingId)),
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
                    this.triggerSelloffTaskGen,
                    this.lootingTaskGen,
                ],
                [       // teardownMode[0] == true
                    this.purchaseEquipmentTaskGen,
                    this.endSelloffTaskGen,
                    this.selloffTaskGen,
                ],
            ],
            [           // Adventuring Mode 1
                [       // teardownMode[1] == false
                    this.triggerBoastingTaskGen,
                    this.gladiatingTaskGen,
                ],
                [       // teardownMode[1] == true
                    this.earnAccoladeTaskGen,
                    this.endBoastingTaskGen,
                    this.boastingTaskGen,
                ],
            ],
            [           // Adventuring Mode 2
                [       // teardownMode[2] == false
                    this.triggerLeadFollowingTaskGen,
                    this.investigatingTaskGen,
                ],
                [       // teardownMode[2] == true
                    this.gainAffiliationTaskGen,
                    this.endLeadFollowingTaskGen,
                    this.leadFollowingTaskGen,
                ]
            ]
        ]
    }
    
    public selectNextTaskGenerator(state: AppState): TaskGenerator {
        let nextTaskGenerator: TaskGenerator;
        nextTaskGenerator = this.prioritizedTaskGenerators.coreTaskGenerators.find(taskGen => taskGen.shouldRun(state));
    
        if (!nextTaskGenerator) {
            const taskGeneratorsForState = this.prioritizedTaskGenerators.adventuringModeTaskGenerators[state.activeTaskMode][+state.hero.isInTeardownMode[state.activeTaskMode]];
            nextTaskGenerator = taskGeneratorsForState.find(taskGen => taskGen.shouldRun(state));
        }
    
        return nextTaskGenerator;
    }
}