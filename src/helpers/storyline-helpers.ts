import { IS_DEBUG } from "../global/config";
import { HeroModification, HeroModificationType, Hero } from "../models/models";
import { randRange } from "./utils";
import { generateNewEquipmentModification, generateSpellOrAbilityModification } from "./hero-manager";

export const PROLOGUE_TASKS = [
    {taskDescription: 'Experiencing an enigmatic and foreboding night vision', durationSeconds: 10},
    {taskDescription: 'Much is revealed about that wise old bastard you\'d underestimated', durationSeconds: 6},
    {taskDescription: 'A shocking series of events leaves you alone and bewildered, but resolute', durationSeconds: 6},
    {taskDescription: 'Drawing upon an unrealized reserve of determination, you set out on a long and dangerous journey', durationSeconds: 4},
    {taskDescription: 'Loading', durationSeconds: 2},
]

export const PROLOGUE_ADVENTURE_NAME = 'Prologue'

export function generateNextAdventure(completedAdventure: Adventure): Adventure {
    const oldChapNumMatch = completedAdventure.name.match(/\d+$/);
    const oldChapNum = !!oldChapNumMatch ? +oldChapNumMatch[0] : 0;
    const newChapDuration = IS_DEBUG ? 60 : (60 * 60 * (1 + 5 * oldChapNum + 1));
    return {name: `Chapter ${oldChapNum + 1}`, progressRequired: newChapDuration};
}

export function generateNewAdventureResults(currentHero: Hero, includeReward: boolean = true): HeroModification[] {
    let results = [
        {
            type: HeroModificationType.SET,
            attributeName: 'currentAdventure',
            data: generateNextAdventure(currentHero.currentAdventure),
        },
        {
            type: HeroModificationType.SET,
            attributeName: 'adventureProgress',
            data: 0,
        },
        {
            type: HeroModificationType.ADD,
            attributeName: 'completedAdventures',
            data: [currentHero.currentAdventure.name],
        },
    ];
    if (includeReward) {
        results.push(randRange(0, 1) ? generateNewEquipmentModification(currentHero) : generateSpellOrAbilityModification(currentHero));
    }
    return results;
}

export interface Adventure {
    name: string,
    progressRequired: number,
}