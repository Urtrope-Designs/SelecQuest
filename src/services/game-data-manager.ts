import { AppState } from "../helpers/models";
import { Observable } from "rxjs/Observable";

import Storage from './storage';

export class GameDataManager {
    private dataStore = new Storage();

    persistAppData(appData$: Observable<AppState>): void {
        appData$.subscribe((data) => {
            this.dataStore.set(`gameData_${data.hero.name}`, data);
        })
    }

    getGameData(heroName: string): Promise<AppState> {
        return this.dataStore.get(`gameData_${heroName}`);
    }
}