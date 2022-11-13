import { GameSettingConfig } from "../models/game-setting-models";
import { GameSetting } from "../global/game-setting";
import { NosqlDatastoreManager } from "./nosql-datastore-manager";

export class GameSettingsManager {
    private availableGameSettings: Map<string, GameSetting>;

    constructor(
        private datastoreMgr: NosqlDatastoreManager,
    ) {
    }

    async init(availableGameSettingFiles: string[]) {
        this.availableGameSettings = new Map<string, GameSetting>();
        for (let file of availableGameSettingFiles) {
            const nextGameSettingConfig = await this.datastoreMgr.getDocument('game-settings', file);
            if (nextGameSettingConfig != null) {
                const nextGameSetting = new GameSetting((nextGameSettingConfig as GameSettingConfig));
                this.availableGameSettings.set(nextGameSetting.gameSettingId, nextGameSetting);
            } else {
                throw new Error(`Failed to load settings for "${file}"`);
            }
        }

        return true;
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

