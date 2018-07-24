import '@ionic/core';

import { Component, Prop, Listen } from '@stencil/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { stateFn } from '../../helpers/state-store';
import { AppState, TaskMode } from '../../helpers/models';
import { Action, ChangeActiveTaskMode } from '../../helpers/actions';
import { createNewCharacter } from '../../helpers/character-manager';

@Component({
    tag: 'my-app',
    styleUrl: 'my-app.scss'
})
export class MyApp {

    @Prop({ connect: 'ion-toast-controller' }) toastCtrl: HTMLIonToastControllerElement;
    @Prop({ context: 'taskMgr'}) taskMgr: {init: (stateStore: Observable<AppState>) => void, getTaskAction$: () => Observable<Action>};
    private actionSubject: Subject<Action>;
    private state: Observable<AppState>;
    
    @Listen('taskAction')
    taskActionhandler(event: CustomEvent) {
        this.actionSubject.next(event.detail);
    }
    @Listen('taskModeAction')
    taskModeActionHandler(event: CustomEvent) {
        this.actionSubject.next(new ChangeActiveTaskMode(event.detail));
    }

    constructor() {
        this.actionSubject = new Subject<Action>();
        this.state = stateFn({ activeTask: null, hasActiveTask: false, character: createNewCharacter(), activeTaskMode: TaskMode.LOOTING }, this.actionSubject.asObservable());
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
        this.taskMgr.init(this.state);
        this.taskMgr.getTaskAction$().subscribe((taskAction: Action) => {
            this.actionSubject.next(taskAction);
        })
    }

    render() {
        return (
            <ion-app>
                <app-home appState={this.state}>
                </app-home>
            </ion-app>
        );
    }
}
