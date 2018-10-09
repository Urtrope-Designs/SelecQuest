import { AppState } from "../helpers/models";
import { Observable } from "rxjs/Observable";
import { tap } from "rxjs/operators";

import Storage from './storage';
import { generateHeroHashFromHero, HERO_HASH_NAME_DELIMITER } from "../helpers/utils";

export class GameDataManager {
    private dataStore = new Storage();

    persistAppData(appData$: Observable<AppState>): Observable<AppState> {
        //todo: return an observable that emits each time datastore.set completes successfully?
        return appData$.pipe(
            tap((data) => {
                if (!!data && !!data.hero) {
                    this.dataStore.set(`${GAME_SAVE_PREFIX}${generateHeroHashFromHero(data.hero)}`, data);
                }
            })
        );
    }

    getGameData(heroHash: string): Promise<AppState> {
        return this.dataStore.get(`${GAME_SAVE_PREFIX}${heroHash}`);
    }

    deleteGameData(heroHash: string) {
        return this.dataStore.remove(`${GAME_SAVE_PREFIX}${heroHash}`);
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

    getAvailableHeroHashToNameMapping(): Promise<{hash:string, name: string}[]> {
        return this.dataStore.keys().then(keys => {
            return keys
                .filter(key => {
                    return key.startsWith(GAME_SAVE_PREFIX);
                })
                .map(key => {
                    return {hash: key.slice(GAME_SAVE_PREFIX.length), name: key.slice(GAME_SAVE_PREFIX.length, key.indexOf(HERO_HASH_NAME_DELIMITER))};
                })
        })
    }
}

const GAME_SAVE_PREFIX = 'gameData_';