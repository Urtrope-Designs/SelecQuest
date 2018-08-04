import { AppState } from "../helpers/models";
import { Observable } from "rxjs/Observable";

import Storage from './storage';
import { generateHeroHashFromHero } from "../helpers/utils";

export class GameDataManager {
    private dataStore = new Storage();

    persistAppData(appData$: Observable<AppState>): void {
        appData$.subscribe((data) => {
            if (!!data && !!data.hero) {
                this.dataStore.set(`gameData_${generateHeroHashFromHero(data.hero)}`, data);
            }
        })
    }

    getGameData(heroHash: string): Promise<AppState> {
        return this.dataStore.get(`gameData_${heroHash}`);
    }

    setActiveHeroHash(heroHash: string): Promise<any> {
        return this.dataStore.set('activeHeroHash', heroHash);
    }

    getActiveHeroHash(): Promise<string> {
        return this.dataStore.get('activeHeroHash');
    }

    clearAllData(): Promise<boolean> {
        return this.dataStore.clear();
    }
}