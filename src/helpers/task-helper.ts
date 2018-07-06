import { CharLoot, CharTrophy, LootingTarget, GladiatingTarget, TaskTargetType, CharLead, LeadType, LeadTarget } from "./models";
import { randRange, randSign, randFromList, makeStringIndefinite, generateRandomName, makeVerbGerund, capitalizeInitial } from "./utils";
import { TASK_PREFIX_MINIMAL, TASK_PREFIX_BAD_FIRST, TASK_PREFIX_BAD_SECOND, TASK_PREFIX_MAXIMAL, TASK_PREFIX_GOOD_FIRST, TASK_PREFIX_GOOD_SECOND, TASK_GERUNDS, STANDARD_GLADIATING_TARGETS, STANDARD_LOOTING_TARGETS, RACES, CLASSES, STANDARD_LEAD_GATHERING_TARGETS, STANDARD_LEAD_TARGETS, IS_DEBUG } from "../global/config";

function determineTaskQuantity(targetLevel: number, taskLevel: number) {
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

function applyTaskNameModifiers(targetLevel: number, taskTarget: LootingTarget): string {
    let taskName = taskTarget.name;

    if ((targetLevel - taskTarget.level) <= -10) {
        taskName = TASK_PREFIX_MINIMAL[taskTarget.type] + ' ' + taskName;
    } else if ((targetLevel - taskTarget.level) < -5) {
        const firstPrefix = randFromList(TASK_PREFIX_BAD_FIRST[taskTarget.type]);
        const secondPrefix = randFromList(TASK_PREFIX_BAD_SECOND[taskTarget.type]);
        taskName = firstPrefix + ' ' + secondPrefix + ' ' + taskName;
    } else if (((targetLevel - taskTarget.level) < 0) && (randRange(0, 1))) {
        taskName = randFromList(TASK_PREFIX_BAD_FIRST[taskTarget.type]) + ' ' + taskName;
    } else if (((targetLevel - taskTarget.level) < 0)) {
        taskName = randFromList(TASK_PREFIX_BAD_SECOND[taskTarget.type]) + ' ' + taskName;
    } else if ((targetLevel - taskTarget.level) >= 10) {
        taskName = TASK_PREFIX_MAXIMAL[taskTarget.type] + ' ' + taskName;
    } else if ((targetLevel - taskTarget.level) > 5) {
        const firstPrefix = randFromList(TASK_PREFIX_GOOD_FIRST[taskTarget.type]);
        const secondPrefix = randFromList(TASK_PREFIX_GOOD_SECOND[taskTarget.type]);
        taskName = firstPrefix + ' ' + secondPrefix + ' ' + taskName;
    } else if (((targetLevel - taskTarget.level) > 0) && (randRange(0, 1))) {
        taskName = randFromList(TASK_PREFIX_GOOD_FIRST[taskTarget.type]) + ' ' + taskName;
    } else if (((targetLevel - taskTarget.level) > 0)) {
        taskName = randFromList(TASK_PREFIX_GOOD_SECOND[taskTarget.type]) + ' ' + taskName;
    }

    return taskName;
}

function randomizeTargetLevel(charLevel: number): number {
    let targetLevel = charLevel;
    for (let i = charLevel; i >= 1; --i) {
        if (randRange(1, 5) <= 2)
            targetLevel += randSign();
        }
    if (targetLevel < 1) {
        targetLevel = 1;
    } 

    return targetLevel;
}

/** select target with level closest to the targetLevel out of random selection of targets */
function randomizeTargetFromList(targetLevel: number, targetOptions: LootingTarget[] | GladiatingTarget[], numIterations: number = 6): LootingTarget | GladiatingTarget {
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
export function generateLootingTaskContentsFromLevel(level: number): {taskName: string, taskLevel: number, lootData: CharLoot[]} {
    let taskName = '';
    let lootData: CharLoot[] = [];

    let targetLevel = randomizeTargetLevel(level);

    let lootTarget = randomizeTargetFromList(targetLevel, STANDARD_LOOTING_TARGETS, 6);

    let quantity = determineTaskQuantity(targetLevel, lootTarget.level);

    targetLevel = Math.floor(targetLevel / quantity);
  
    taskName = applyTaskNameModifiers(targetLevel, lootTarget);

    taskName = TASK_GERUNDS[lootTarget.type] + ' ' + makeStringIndefinite(taskName, quantity);

    lootData.push({
        name: lootTarget.reward,
        quantity: 1,
        value: 1,
    });

    return {taskName: taskName, taskLevel: targetLevel * quantity, lootData: lootData};
}

export function generateGladiatingTaskContentsFromLevel(level: number): {taskName: string, taskLevel: number, trophyData: CharTrophy[]} {
    let taskName = '';
    let trophyData: CharTrophy[] = [];

    let targetLevel = randomizeTargetLevel(level);
    let taskLevel = targetLevel;

    if (randRange(0, 1)) {
        // dueling task
        let foeLevel = randomizeTargetLevel(level);
        let foeRace = randFromList(RACES);
        let foeClass = randFromList(CLASSES);
        let quantity = determineTaskQuantity(targetLevel, foeLevel);
        if (quantity === 1) {
            let foeName = generateRandomName();
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
        gladiatingTarget = randomizeTargetFromList(targetLevel, STANDARD_GLADIATING_TARGETS, 6);
        
        let quantity = determineTaskQuantity(targetLevel, gladiatingTarget.level);
        targetLevel = Math.floor(targetLevel / quantity);
      
        // todo: need to either fit trials into the mould of this function, or create a new function/modify the old one.
        taskName = applyTaskNameModifiers(targetLevel, gladiatingTarget);
    
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

export function generateInvestigatingTaskContents(): {taskName: string, leadData: CharLead[]} {
    let investigatingTaskName = '';
    let leadData = [];

    const investigatingTarget = randFromList(STANDARD_LEAD_GATHERING_TARGETS);

    investigatingTaskName = capitalizeInitial(`${investigatingTarget.gerundPhrase} ${randFromList(investigatingTarget.predicateOptions)}`);

    const leadTargetType: LeadType = randFromList(investigatingTarget.leadTypes);
    const leadTarget: LeadTarget = randFromList(STANDARD_LEAD_TARGETS[leadTargetType]);

    const leadPredicate = leadTarget.predicateFactory.apply(null);
    const lead: CharLead = {
        questlogName: capitalizeInitial(`${leadTarget.verb} ${leadPredicate}`),
        taskName: capitalizeInitial(`${makeVerbGerund(leadTarget.verb)} ${leadPredicate}`),
        value: 1,
    }

    leadData.push(lead);

    return {taskName: investigatingTaskName, leadData: leadData};
}

export function getTradeInCostForLevel(level: number): number {
    return IS_DEBUG ? 25 : 5 * level**2 + 10 * level + 20;
}
