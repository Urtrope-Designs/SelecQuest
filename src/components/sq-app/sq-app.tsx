import { h, Component, Listen, State } from '@stencil/core';
import { Subject } from 'rxjs';

import { stateFn } from '../../global/state-store';
import { AppState, Task } from '../../models/models';
import { Action, ChangeActiveTaskMode, SetActiveHero } from '../../global/actions';
import { GameDataManager } from '../../services/game-data-manager';
import { generateHeroHashFromHero, promiseTimeout } from '../../global/utils';
// import { PlayScreen } from '../play-screen/play-screen';
import { GameSettingsManager } from '../../services/game-settings-manager';
import { HeroInitData } from '../../models/hero-models';
import { HeroManager } from '../../services/hero-manager';
import { PlayTaskGenerator } from '../../services/play-task-generator';
import { PlayTaskResultGenerator } from '../../services/play-task-result-generator';
import { TaskMode, ITaskGenerator } from '../../models/task-models';
import { PlayTaskManager } from '../../services/play-task-manager';
import { CatchUpTaskGenerator } from '../../services/catch-up-task-generator';
import { GameDataTransformManager } from '../../services/game-data-transform-manager';
import { NosqlDatastoreManager } from '../../services/nosql-datastore-manager';
import { GameConfigManager } from '../../services/game-config-manager';
import '../../global/inobounce';

@Component({
    tag: 'sq-app',
    styleUrl: 'sq-app.scss'
})
export class SqApp {
    private actionSubject: Subject<Action> = new Subject<Action>();
    @State() state: AppState;
    @State() availableHeroes: {hash: string, name: string}[];
    @State() loadingErrorMsg = '';

    private datastoreMgr: NosqlDatastoreManager;
    private gameConfigMgr: GameConfigManager;
    private taskMgr: PlayTaskManager;
    private gameDataMgr: GameDataManager;
    private gameDataTransformMgr: GameDataTransformManager;
    private heroMgr: HeroManager;
    private gameSettingsMgr: GameSettingsManager;
    private playTaskGenerator: ITaskGenerator;
    private catchUpTaskGenerator: ITaskGenerator;
    private taskResultGenerator: PlayTaskResultGenerator;

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
            this.gameDataMgr.clearAllData().then(() => {
                this._updateAvailableHeroes();
                this.loadingErrorMsg = '';
            });
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
        });
    }

    async componentWillLoad() {
        try {
            this.datastoreMgr = new NosqlDatastoreManager();
            // todo: probably need to pull available Game Setting names from gameDataMgr eventually
            this.gameSettingsMgr = new GameSettingsManager(this.datastoreMgr);
            await this.gameSettingsMgr.init(['fantasy-setting']);
            this.gameConfigMgr = new GameConfigManager(this.datastoreMgr);

            this.gameDataMgr = new GameDataManager();
            this.gameDataTransformMgr = new GameDataTransformManager();
            this.heroMgr = new HeroManager(this.gameSettingsMgr, this.gameConfigMgr);
            this.taskResultGenerator = new PlayTaskResultGenerator(this.gameSettingsMgr, this.gameConfigMgr);
            this.playTaskGenerator = new PlayTaskGenerator(this.taskResultGenerator, this.heroMgr, this.gameSettingsMgr, this.gameConfigMgr);
            this.catchUpTaskGenerator = new CatchUpTaskGenerator(this.taskResultGenerator, this.heroMgr, this.gameSettingsMgr, this.gameConfigMgr);

            promiseTimeout(10000, this.gameDataMgr.getActiveHeroHash())
                .then((heroHash: string) => {
                    if (!!heroHash) {
                        return this.gameDataMgr.getGameData(heroHash)
                            .then(state => {
                                if (state == null) {
                                    return DEFAULT_APP_STATE;
                                } else {
                                    state = this.gameDataTransformMgr.transformGameData(state, this.gameSettingsMgr, this.gameConfigMgr);
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
                })
                .catch(err => {
                    console.log('hero data load error: ', err);
                    this.loadingErrorMsg = err;
                })
        } catch (err) {
            console.log('app load error: ', err);
            this.loadingErrorMsg = err;
        }
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

    private isCatchUpTask(currentTask: Task): boolean {
        if (!this.state.currentTask) {
            return false;
        }
        const catchUpCutoff = new Date().getTime() - 200;
        return currentTask.taskStartTime + currentTask.durationMs < catchUpCutoff;
    }

    render() {
        if (!!this.loadingErrorMsg) {
            return (
                <div class="appCenter">
                    <div>{this.loadingErrorMsg}</div>
                    <div class="buttonRow">
                        <button class="selected" onClick={() => document.location.reload(true)}>Try refresh</button>
                        <button class="selected" onClick={() => this.clearAllGameDataHandler()}>Clear All Data</button>
                    </div>
                </div>
            )
        }
        else if (!this.state || this.isCatchUpTask(this.state.currentTask)) {
            return (
                <div class="appLoading">
                    Loading...
                </div>
            )
        } else {
            return (
                !!this.state.hero
                ? <sq-play-screen 
                        appState={this.state}
                        gameSetting={this.gameSettingsMgr.getGameSettingById(this.state.hero.gameSettingId)}
                        availableHeroes={this.availableHeroes}
                    ></sq-play-screen>
                : <sq-create-hero-screen gameSettingsMgr={this.gameSettingsMgr}></sq-create-hero-screen>
            );
        }
    }
}

const DEFAULT_APP_STATE: AppState = {
    hero: null,
    currentTask: null,
    hasActiveTask: false,
    activeTaskMode: TaskMode.LOOT_MODE,
};
