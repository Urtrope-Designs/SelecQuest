import { CatchUpTaskGenerator } from './catch-up-task-generator';
import { PlayTaskResultGenerator } from './play-task-result-generator';
import { HeroManager } from './hero-manager';
import { GameSettingsManager } from './game-settings-manager';

const taskResultGeneratorStub = {} as PlayTaskResultGenerator;
const heroMgrStub = {} as HeroManager;
const gameSettingsMgrStub = {} as GameSettingsManager;

describe('CatchUpTaskGenerator', () => {
    it('should build', () => {
        expect(new CatchUpTaskGenerator(taskResultGeneratorStub, heroMgrStub, gameSettingsMgrStub)).toBeTruthy();
    })
})