import { PlayTaskGenerator } from "./play-task-generator";

function testAlgo(level) {
    return Math.max(Math.min(PlayTaskGenerator.randomizeTargetLevel(level), level), level-4, 1)
}

describe('PlayTaskGenerator', () => {
    describe('Loot major reward generation', () => {
        it (`should pick a level no greater than hero's, no less than 1, and no less than hero-level - 4`, () => {
            let testVal = testAlgo(1);
            expect(testVal).toEqual(1);
            
            testVal = testAlgo(3);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(3);
            expect(testVal).toBeGreaterThanOrEqual(1);
            testVal = testAlgo(3);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(3);
            expect(testVal).toBeGreaterThanOrEqual(1);
            testVal = testAlgo(3);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(3);
            expect(testVal).toBeGreaterThanOrEqual(1);
            
            testVal = testAlgo(14);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(14);
            expect(testVal).toBeGreaterThanOrEqual(10);
            testVal = testAlgo(14);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(14);
            expect(testVal).toBeGreaterThanOrEqual(10);
            testVal = testAlgo(14);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(14);
            expect(testVal).toBeGreaterThanOrEqual(10);
            testVal = testAlgo(14);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(14);
            expect(testVal).toBeGreaterThanOrEqual(10);
            testVal = testAlgo(14);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(14);
            expect(testVal).toBeGreaterThanOrEqual(10);
            testVal = testAlgo(14);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(14);
            expect(testVal).toBeGreaterThanOrEqual(10);
            testVal = testAlgo(14);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(14);
            expect(testVal).toBeGreaterThanOrEqual(10);
            testVal = testAlgo(14);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(14);
            expect(testVal).toBeGreaterThanOrEqual(10);
            testVal = testAlgo(14);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(14);
            expect(testVal).toBeGreaterThanOrEqual(10);
            testVal = testAlgo(14);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(14);
            expect(testVal).toBeGreaterThanOrEqual(10);
            testVal = testAlgo(14);
            console.log(testVal);
            expect(testVal).toBeLessThanOrEqual(14);
            expect(testVal).toBeGreaterThanOrEqual(10);
        })
    })
})