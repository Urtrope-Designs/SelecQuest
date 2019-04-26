import { GameSettingConfig } from "../models/game-setting-models";
import { GameSetting } from "../global/game-setting";
import firebase from 'firebase/app';
import 'firebase/firestore';

export class GameSettingsManager {
    private availableGameSettings: Map<string, GameSetting>;
    private db: firebase.firestore.Firestore;

    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyBw73BRk-qWeZm-fp3-Ijf7s0EemdaWuCQ",
            authDomain: "selecquest.firebaseapp.com",
            databaseURL: "https://selecquest.firebaseio.com",
            projectId: "selecquest",
            storageBucket: "selecquest.appspot.com",
            messagingSenderId: "434339253679"
        };
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.firestore();
    }

    async init(availableGameSettingFiles: string[]) {
        this.availableGameSettings = new Map<string, GameSetting>();
        for (let file of availableGameSettingFiles) {
            const fsDoc = await this.db.collection('game-settings').doc(file).get();
            if (fsDoc.exists) {
                const nextGameSettingConfig = fsDoc.data();
                const nextGameSetting = new GameSetting((nextGameSettingConfig as GameSettingConfig));
                this.availableGameSettings.set(nextGameSetting.gameSettingId, nextGameSetting);
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

