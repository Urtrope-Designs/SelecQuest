import '@ionic/core';

import { Component, Prop, Listen, State } from '@stencil/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { stateFn } from '../../helpers/state-store';
import { AppState, TaskMode } from '../../helpers/models';
import { Action, ChangeActiveTaskMode, TaskCompleted } from '../../helpers/actions';
import { GameDataManager } from '../../services/game-data-manager';

@Component({
    tag: 'sq-app',
    styleUrl: 'sq-app.scss'
})
export class SqApp {
    @Prop({ connect: 'ion-toast-controller' }) toastCtrl: HTMLIonToastControllerElement;
    @Prop({ context: 'taskMgr'}) taskMgr: {init: (stateStore: Observable<AppState>) => void, getTaskAction$: () => Observable<Action>};
    private actionSubject: Subject<Action> = new Subject<Action>();
    @State() state: AppState;
    private gameDataMgr = new GameDataManager();
    
    @Listen('taskAction')
    taskActionhandler(event: CustomEvent) {
        this.actionSubject.next(event.detail);
    }
    @Listen('taskModeAction')
    taskModeActionHandler(event: CustomEvent) {
        this.actionSubject.next(new ChangeActiveTaskMode(event.detail));
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
            .then((serializedState: AppState) => {
                if (!!serializedState && !!serializedState.activeTask) {
                    const taskTimeRemaining = serializedState.activeTask.taskStartTime + serializedState.activeTask.durationMs - new Date().getTime();
                    serializedState.activeTask.completionTimeoutId = setTimeout(() => {
                        this.actionSubject.next(new TaskCompleted(serializedState.activeTask));
                    }, Math.max(taskTimeRemaining, 10));
                } 
                return serializedState;
            })
            .then(deserializedState => {
                const initialData = deserializedState || DEFAULT_APP_STATE;
                let state$ = stateFn(initialData, this.actionSubject.asObservable());
                this.gameDataMgr.persistAppData(state$);
                this.taskMgr.init(state$);
                this.taskMgr.getTaskAction$().subscribe((taskAction: Action) => {
                    this.actionSubject.next(taskAction);
                })

                state$.subscribe(state => {
                    this.state = state;
                });
            });
}

    render() {
        if (!!this.state) {
            return (
                <ion-app>
                    {
                        !this.state.hero
                        ? <sq-play-screen appState={this.state}></sq-play-screen>
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
