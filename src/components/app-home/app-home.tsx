import { Component, Prop, State } from '@stencil/core';
import { Observable } from 'rxjs/Observable';

import { AppState, Character } from '../../helpers/models';

@Component({
    tag: 'app-home',
    styleUrl: 'app-home.scss'
})
export class AppHome {
    @Prop() appState: Observable<AppState>;

    @State() character: any;

    componentWillLoad() {
        this.appState.subscribe((state: AppState) => {
            this.character = state.character;
        })
    }

    render() {
        return (
            <ion-page class='show-page'>
                <ion-header md-height='56px'>
                    <ion-toolbar color='primary'>
                        <ion-title>SelecQuest</ion-title>
                    </ion-toolbar>
                </ion-header>

                <ion-content>
                    <p>
                        Character Str = {this.character.str}
                    </p>

                    <stencil-route-link url='/profile/stencil'>
                        <ion-button>
                            Profile page
            </ion-button>
                    </stencil-route-link>
                </ion-content>
            </ion-page>
        );
    }
}
