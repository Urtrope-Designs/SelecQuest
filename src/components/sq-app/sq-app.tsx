import '@ionic/core';

import { Component, Prop, Listen, State } from '@stencil/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { stateFn } from '../../helpers/state-store';
import { AppState, TaskMode } from '../../helpers/models';
import { Action, ChangeActiveTaskMode, SetActiveHero } from '../../helpers/actions';
import { GameDataManager } from '../../services/game-data-manager';
import { generateHeroHashFromHero } from '../../helpers/utils';
import { PlayScreen } from '../play-screen/play-screen';

@Component({
    tag: 'sq-app',
    styleUrl: 'sq-app.scss'
})
export class SqApp {
    @Prop({ connect: 'ion-toast-controller' }) toastCtrl: HTMLIonToastControllerElement;
    @Prop({ context: 'taskMgr'}) taskMgr: {init: (stateStore: Observable<AppState>, emulateTaskTimeGap?: boolean) => void, getTaskAction$: () => Observable<Action>};
    private actionSubject: Subject<Action> = new Subject<Action>();
    @State() state: AppState;
    private availableHeroes: {hash: string, name: string}[];
    private gameDataMgr = new GameDataManager();
    private playScreen: PlayScreen;
    
    @Listen('taskModeAction')
    taskModeActionHandler(event: CustomEvent) {
        this._queueAction(new ChangeActiveTaskMode(event.detail));
    }
    @Listen('startNewHero')
    startNewHeroHandler(event: CustomEvent) {
        const newGameState = Object.assign({}, DEFAULT_APP_STATE, {hero: event.detail});
        this.gameDataMgr.setActiveHeroHash(generateHeroHashFromHero(event.detail));
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

    /*
        Handle service worker updates correctly.
        This code will show a toast letting the
        user of the PWA know that there is a 
        new version available. When they click the
        reload button it then reloads the page 
        so that the new service worker can take over
        and serve the fresh content
    */
    @Listen('window:swUpdate')
    async onSWUpdate() {
        const toast = await this.toastCtrl.create({
            message: 'New version available',
            showCloseButton: true,
            closeButtonText: 'Reload'
        });
        await toast.present();
        await toast.onWillDismiss();
        window.location.reload();
    }

    private _updateAvailableHeroes() {
        this.gameDataMgr.getAvailableHeroHashToNameMapping().then(heroes => {
            this.availableHeroes = heroes;
            if (!!this.playScreen) {
                this.playScreen.availableHeroes = this.availableHeroes;
            }
        });
    }

    componentWillLoad() {
        this.gameDataMgr.getActiveHeroHash()
            .then((heroHash: string) => {
                if (!!heroHash) {
                    return this.gameDataMgr.getGameData(heroHash)
                        .then(state => {
                            if (state == null) {
                                return DEFAULT_APP_STATE;
                            } else {
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
                this.taskMgr.init(state$, true);
                this.taskMgr.getTaskAction$().subscribe((taskAction: Action) => {
                    this._queueAction(taskAction);
                })

                state$.subscribe(state => {
                    this.state = state;
                });
            });

        this._updateAvailableHeroes();
    }

    private _queueAction(newAction: Action) {
        console.log('queueing action')
        if (newAction != null) {
            Promise.resolve().then(() => {
                console.log(newAction);
                this.actionSubject.next(newAction);
            })
        }
    }

    render() {
        if (!!this.state) {
            return (
                <ion-app>
                    {
                        !!this.state.hero
                        ? <sq-play-screen appState={this.state} availableHeroes={this.availableHeroes} ref={(el: any) => this.playScreen = el}></sq-play-screen>
                        : <sq-create-hero-screen></sq-create-hero-screen>
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
    activeTaskMode: TaskMode.LOOTING,
};
