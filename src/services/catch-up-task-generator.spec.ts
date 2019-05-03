import { CatchUpTaskGenerator } from './catch-up-task-generator';
import { PlayTaskResultGenerator } from './play-task-result-generator';
import { HeroManager } from './hero-manager';
import { GameSettingsManager } from './game-settings-manager';

// TODO: need to mock everything needed from GameSettingConfig in catch-up tasks
const gameSettingsMgrStub: GameSettingsManager = {
    getGameSettingById: () => {return {prologueAdventureName: 'testPrologueAdventureName'}},
} as any;
const taskResultGeneratorStub = new PlayTaskResultGenerator(gameSettingsMgrStub);
const heroMgrStub = new HeroManager(gameSettingsMgrStub);

// TODO: need to mock AppState object...

describe('CatchUpTaskGenerator', () => {
    test('should build', () => {
        expect(new CatchUpTaskGenerator(taskResultGeneratorStub, heroMgrStub, gameSettingsMgrStub)).toBeTruthy();
    })

    // test('should test for major rewards with every catchup task', () => {
    //     const cutg = new CatchUpTaskGenerator(taskResultGeneratorStub, heroMgrStub, gameSettingsMgrStub);
    // })
})