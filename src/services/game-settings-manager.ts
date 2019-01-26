import { GameSettingConfig } from "../models/game-setting-config";
import { GameSetting } from "../helpers/game-setting";

export class GameSettingsManager {
    private static instance: GameSettingsManager;
    private availableGameSettings: Map<string, GameSetting>;

    private constructor() {}

    static getInstance() {
        if (!GameSettingsManager.instance) {
            GameSettingsManager.instance = new GameSettingsManager();
        }
        return GameSettingsManager.instance;
    }

    async init(availableGameSettingFiles: string[]) {
        this.availableGameSettings = new Map<string, GameSetting>();
        for (let file of availableGameSettingFiles) {
            const nextGameSetting = new GameSetting(await this.loadGameSettingFile(file + '.ts'));
            this.availableGameSettings.set(nextGameSetting.gameSettingId, nextGameSetting);
        }

        return true;
    }

    private async loadGameSettingFile(_filename: string): Promise<GameSettingConfig> {
        return Promise.resolve({
            gameSettingId: '1',
            gameSettingName: 'Fantasy',
            charRaces: [
                {
                    raceName: 'Demimutant',
                    trophyName: 'genome'
                },
                {
                    raceName: 'Werefellow',
                    trophyName: 'bowler hat'
                },
                {
                    raceName: 'Fartling',
                    trophyName: 'cloud'
                },
                {
                    raceName: 'Owl-head',
                    trophyName: 'hoot'
                },
                {
                    raceName: 'Half-mermaid',
                    trophyName: 'bident'
                }
            ],
            charClasses: [
                'Veg Crisper',
                'Cat-caller',
                'Metanarc',
                'War Flautist',
                'Sarcasminista',
                'Meter Beater',
                'Chef de Cuisine',
                'Basher',
                'Smasher',
                'Warlock',
                'Semi-retired Heckler'
            ],
            statNames: [
                'str',
                'dex',
                'con',
                'int',
                'wis',
                'cha'
            ]
        });
    }

    getAvailableGameSettingNames(): string[] {
        return this.getAllGameSettings().map(setting => setting.gameSettingName);
    }

    getAllGameSettings(): GameSetting[] {
        return Array.from(this.availableGameSettings.values());
    }

    getGameSettingById(requestedId: string): GameSetting {
        return this.availableGameSettings.get(requestedId);
    }

}

