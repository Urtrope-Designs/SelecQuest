import { Component, Prop, Listen } from '@stencil/core';
import { ToastController } from '@ionic/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { stateFn } from '../../helpers/state-store';
import { AppState } from '../../helpers/models';
import { Action } from '../../helpers/actions';
import { createNewCharacter } from '../../helpers/character-manager';

@Component({
    tag: 'my-app',
    styleUrl: 'my-app.scss'
})
export class MyApp {

    @Prop({ connect: 'ion-toast-controller' }) toastCtrl: ToastController;
    private actionSubject: Subject<Action>;
    private state: Observable<AppState>;
    
    @Listen('taskAction')
    taskActionhandler(event: CustomEvent) {
        this.actionSubject.next(event.detail);
    }

    constructor() {
        this.actionSubject = new Subject<Action>();
        this.state = stateFn({ activeTask: null, hasActiveTask: false, character: createNewCharacter() }, this.actionSubject.asObservable());
    }

    componentDidLoad() {
        /*
          Handle service worker updates correctly.
          This code will show a toast letting the
          user of the PWA know that there is a 
          new version available. When they click the
          reload button it then reloads the page 
          so that the new service worker can take over
          and serve the fresh content
        */
        window.addEventListener('swUpdate', () => {
            this.toastCtrl.create({
                message: 'New version available',
                showCloseButton: true,
                closeButtonText: 'Reload'
            }).then((toast) => {
                toast.present();
            });
        })
    }

    @Listen('body:ionToastWillDismiss')
    reload() {
        window.location.reload();
    }

    render() {
        return (
            <ion-app>
                <task-manager stateStore={this.state}></task-manager>
                <app-home appState={this.state}>
                </app-home>
            </ion-app>
        );
    }
}
