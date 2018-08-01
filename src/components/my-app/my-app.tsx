import '@ionic/core';

import { Component, Prop, Listen, State } from '@stencil/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { stateFn } from '../../helpers/state-store';
import { AppState, TaskMode } from '../../helpers/models';
import { Action, ChangeActiveTaskMode, TaskCompleted } from '../../helpers/actions';
import { createNewCharacter } from '../../helpers/character-manager';
import { GameDataManager } from '../../services/game-data-manager';

@Component({
    tag: 'my-app',
    styleUrl: 'my-app.scss'
})
export class MyApp {

    @Prop({ connect: 'ion-toast-controller' }) toastCtrl: HTMLIonToastControllerElement;
    @Prop({ context: 'taskMgr'}) taskMgr: {init: (stateStore: Observable<AppState>) => void, getTaskAction$: () => Observable<Action>};
    private actionSubject: Subject<Action> = new Subject<Action>();
    @State() state: Observable<AppState>;
    private statePromise: Promise<Observable<AppState>>;
    private gameDataMgr = new GameDataManager();
    
    @Listen('taskAction')
    taskActionhandler(event: CustomEvent) {
        this.actionSubject.next(event.detail);
    }
    @Listen('taskModeAction')
    taskModeActionHandler(event: CustomEvent) {
        this.actionSubject.next(new ChangeActiveTaskMode(event.detail));
    }

    constructor() {
        this.statePromise = new Promise((resolve, reject) => {
            this.gameDataMgr.getGameData('Garg')
                .then((serializedState: AppState) => {
                    if (!!serializedState && !!serializedState.activeTask) {
                        const taskTimeRemaining = serializedState.activeTask.taskStartTime + serializedState.activeTask.durationMs - new Date().getTime();
                        serializedState.activeTask.completionTimeoutId = setTimeout(() => {
                            this.actionSubject.next(new TaskCompleted(serializedState.activeTask));
                        }, Math.max(taskTimeRemaining, 10));
                    } 
                    return serializedState;
                })
                .then(state => {
                    const initialData = state || { activeTask: null, hasActiveTask: false, character: createNewCharacter(), activeTaskMode: TaskMode.LOOTING };
                    this.state = stateFn(initialData, this.actionSubject.asObservable());
                    this.gameDataMgr.persistAppData(this.state);
                    resolve(this.state);
                })
                .catch(err => {
                    reject(err);
                })
        });
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
        this.statePromise
            .then((state) => {
                this.taskMgr.init(state);
                this.taskMgr.getTaskAction$().subscribe((taskAction: Action) => {
                    this.actionSubject.next(taskAction);
                })
            })
    }

    render() {
        if (this.state) {
            return (
                <ion-app>
                    <app-home appState={this.state}>
                    </app-home>
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
