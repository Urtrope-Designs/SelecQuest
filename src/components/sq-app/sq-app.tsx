import { Component, Listen, State } from '@stencil/core';
import { Subject } from 'rxjs/Subject';

import { stateFn } from '../../global/state-store';
import { AppState } from '../../models/models';
import { Action, ChangeActiveTaskMode, SetActiveHero, SetIsInCatchUpMode } from '../../global/actions';
import { GameDataManager } from '../../services/game-data-manager';
import { generateHeroHashFromHero } from '../../global/utils';
import { PlayScreen } from '../play-screen/play-screen';
import { GameSettingsManager } from '../../services/game-settings-manager';
import { HeroInitData } from '../../models/hero-models';
import { HeroManager } from '../../services/hero-manager';
import { PlayTaskGenerator } from '../../services/play-task-generator';
import { PlayTaskResultGenerator } from '../../services/play-task-result-generator';
import { TaskMode, ITaskGenerator } from '../../models/task-models';
import { PlayTaskManager } from '../../services/play-task-manager';
import { takeWhile } from 'rxjs/operators';
import { CatchUpTaskGenerator } from '../../services/catch-up-task-generator';

@Component({
    tag: 'sq-app',
    styleUrl: 'sq-app.scss'
})
export class SqApp {
    private actionSubject: Subject<Action> = new Subject<Action>();
    @State() state: AppState;
    private availableHeroes: {hash: string, name: string}[];
    
    private taskMgr: PlayTaskManager;
    private gameDataMgr: GameDataManager;
    private heroMgr: HeroManager;
    private gameSettingsMgr: GameSettingsManager;
    private playTaskGenerator: ITaskGenerator;
    private catchUpTaskGenerator: ITaskGenerator;
    private taskResultGenerator: PlayTaskResultGenerator;

    private playScreen: PlayScreen;
    
    @Listen('taskModeAction')
    taskModeActionHandler(event: CustomEvent) {
        this._queueAction(new ChangeActiveTaskMode(event.detail));
    }
    @Listen('startNewHero')
    startNewHeroHandler(event: CustomEvent<HeroInitData>) {
        const newHero = this.heroMgr.createNewHero(event.detail);
        const newGameState = Object.assign({}, DEFAULT_APP_STATE, {hero: newHero});
        this.gameDataMgr.setActiveHeroHash(generateHeroHashFromHero(newHero));
        this._queueAction(new SetActiveHero(newGameState));
        setTimeout(() => {
            this._updateAvailableHeroes();
        }, 100);
    }
    @Listen('clearAllGameData')
    clearAllGameDataHandler() {
        this._queueAction(new SetActiveHero(DEFAULT_APP_STATE));
        setTimeout(() => {
            this.gameDataMgr.clearAllData().then(() => {this._updateAvailableHeroes()});
        }, 100)
    }
    @Listen('buildNewHero')
    buildNewHeroHandler() {
        this.gameDataMgr.setActiveHeroHash(null);
        this._queueAction(new SetActiveHero(DEFAULT_APP_STATE));
    }
    @Listen('playNewHero')
    playNewHeroHandler(event: CustomEvent) {
        this.gameDataMgr.getGameData(event.detail)
            .then((newHeroState) => {
                this._queueAction(new SetActiveHero(newHeroState || DEFAULT_APP_STATE));
                this.gameDataMgr.setActiveHeroHash(generateHeroHashFromHero(newHeroState.hero));
            })
    }
    @Listen('deleteHero')
    deleteHeroHandler(event: CustomEvent) {
        if (event.detail == generateHeroHashFromHero(this.state.hero)) {
            this.gameDataMgr.setActiveHeroHash(null);
            this._queueAction(new SetActiveHero(DEFAULT_APP_STATE));
        }
        setTimeout(() => {
            this.gameDataMgr.deleteGameData(event.detail);
            this._updateAvailableHeroes();
        }, 100);
    }

    private _updateAvailableHeroes() {
        this.gameDataMgr.getAvailableHeroHashToNameMapping().then(heroes => {
            this.availableHeroes = heroes;
            if (!!this.playScreen) {
                this.playScreen.availableHeroes = this.availableHeroes;
            }
        });
    }

    async componentWillLoad() {
        // todo: probably need to pull available Game Setting names from gameDataMgr eventually
        this.gameSettingsMgr = new GameSettingsManager();
        await this.gameSettingsMgr.init(['fantasy_setting_config']);

        this.gameDataMgr = new GameDataManager();
        this.heroMgr = new HeroManager(this.gameSettingsMgr);
        this.taskResultGenerator = new PlayTaskResultGenerator(this.gameSettingsMgr);
        this.playTaskGenerator = new PlayTaskGenerator(this.taskResultGenerator, this.heroMgr, this.gameSettingsMgr);
        this.catchUpTaskGenerator = new CatchUpTaskGenerator(this.taskResultGenerator, this.heroMgr, this.gameSettingsMgr);

        this.gameDataMgr.getActiveHeroHash()
            .then((heroHash: string) => {
                if (!!heroHash) {
                    return this.gameDataMgr.getGameData(heroHash)
                        .then(state => {
                            if (state == null) {
                                return DEFAULT_APP_STATE;
                            } else {
                                state.isInCatchUpMode = true;
                                return state;
                            }
                        });
                } else {
                    return DEFAULT_APP_STATE;
                }
            })
            .then(state => {
                const initialData = state || DEFAULT_APP_STATE;
                let state$ = stateFn(initialData, this.actionSubject.asObservable());
                state$ = this.gameDataMgr.persistAppData(state$);
                this.taskMgr = new PlayTaskManager(state$, this.playTaskGenerator, this.catchUpTaskGenerator);
                this.taskMgr.getTaskAction$().subscribe((taskAction: Action) => {
                    this._queueAction(taskAction);
                })

                state$.subscribe(state => {
                    this.state = state;
                });

                state$.pipe(
                    takeWhile(state => {
                        return !!state && !!state.activeTask && state.activeTask.taskStartTime + state.activeTask.durationMs <= new Date().getTime();
                    })
                ).subscribe(null, null, () => {
                    this._queueAction(new SetIsInCatchUpMode(false));
                })
            });

        this._updateAvailableHeroes();
        return;
    }

    private _queueAction(newAction: Action) {
        if (newAction != null) {
            Promise.resolve().then(() => {
                this.actionSubject.next(newAction);
            })
        }
    }

    render() {
        if (!!this.state && !this.state.isInCatchUpMode) {
            return (
                <ion-app>
                    {
                        !!this.state.hero
                        ? <sq-play-screen 
                                appState={this.state}
                                gameSetting={this.gameSettingsMgr.getGameSettingById(this.state.hero.gameSettingId)}
                                availableHeroes={this.availableHeroes}
                                ref={(el: any) => this.playScreen = el}
                            ></sq-play-screen>
                        : <sq-create-hero-screen gameSettingsMgr={this.gameSettingsMgr}></sq-create-hero-screen>
                    }
                </ion-app>
            );
        } else {
            return (
                <div class="appLoading">
                    Loading...
                </div>
            )
        }
    }
}

const DEFAULT_APP_STATE: AppState = {
    hero: null,
    activeTask: null,
    hasActiveTask: false,
    activeTaskMode: TaskMode.LOOT_MODE,
    isInCatchUpMode: true,
};
