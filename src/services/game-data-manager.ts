import { AppState } from "../helpers/models";
import { Observable } from "rxjs/Observable";

import Storage from './storage';

export class GameDataManager {
    private dataStore = new Storage();

    constructor() {
        this.dataStore.get('anything').then(() => {console.log('Ready')});
        this.dataStore.set('bogus', null);
    }

    persistAppData(appData$: Observable<AppState>): void {
        appData$.subscribe((data) => {
            this.dataStore.set(`gameData_${data.character.name}`, data);
        })
    }

    getGameData(heroName: string): Promise<AppState> {
        return this.dataStore.get(`gameData_${heroName}`);
    }
}