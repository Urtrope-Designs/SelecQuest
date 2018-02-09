import { Component, Prop, Listen } from '@stencil/core';
import { ToastController } from '@ionic/core';
import { Observable } from 'rxjs/Observable';

import { TaskManager } from '../../helpers/task-manager';
import { stateFn } from '../../helpers/state-store';
import { AppState } from '../../helpers/models';
import { ActionManager } from '../../helpers/actions';
import { createNewCharacter } from '../../helpers/character-manager';

@Component({
    tag: 'my-app',
    styleUrl: 'my-app.scss'
})
export class MyApp {

    @Prop({ connect: 'ion-toast-controller' }) toastCtrl: ToastController;
    public taskMgr: TaskManager;
    public actionMgr: ActionManager;
    private state: Observable<AppState>;

    constructor() {
        this.actionMgr = new ActionManager();
        this.state = stateFn({ activeTask: null, hasActiveTask: false, character: createNewCharacter() }, this.actionMgr.getActionManager());
        this.taskMgr = new TaskManager(this.state, this.actionMgr);        
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
                <app-home appState={this.state}>
                </app-home>
            </ion-app>
        );
    }
}
