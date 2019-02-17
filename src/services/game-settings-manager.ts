import { GameSettingConfig } from "../models/game-setting-models";
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
            const nextGameSetting = new GameSetting(await this.loadGameSettingFile(file + '.json'));
            this.availableGameSettings.set(nextGameSetting.gameSettingId, nextGameSetting);
        }

        return true;
    }

    private async loadGameSettingFile(filename: string): Promise<GameSettingConfig> {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.addEventListener('load', () => {
                if (req.status === 200) {
                    console.log('xhr response: ', req.response);
                    resolve(req.response);
                } else {
                    console.log('xhr error!');
                    reject(req.status)
                }
            });
            req.open('GET', '/assets/game-settings/' + filename);
            req.responseType = 'json';
            req.send();
        })
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

