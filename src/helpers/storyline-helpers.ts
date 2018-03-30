export const PROLOGUE_TASKS = [
    {taskDescription: 'Experiencing an enigmatic and foreboding night vision', durationSeconds: 10},
    {taskDescription: 'Much is revealed about that wise old bastard you\'d underestimated', durationSeconds: 6},
    {taskDescription: 'A shocking series of events leaves you alone and bewildered, but resolute', durationSeconds: 6},
    {taskDescription: 'Drawing upon an unrealized reserve of determination, you set out on a long and dangerous journey', durationSeconds: 4},
    {taskDescription: 'Loading', durationSeconds: 2},
]

export const PROLOGUE_ADVENTURE_NAME = 'Prologue'

export function generateNextAdventureName(completedAdventure: Adventure): Adventure {
    const oldChapNum = +completedAdventure.name.match(/\d+$/)[0] || 0;
    return {name: `Chapter ${oldChapNum + 1}`, progressRequired: 60};
}

export interface Adventure {
    name: string,
    progressRequired: number,
}