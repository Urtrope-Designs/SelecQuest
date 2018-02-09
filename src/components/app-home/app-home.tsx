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
                    <p>
                        Spells:
                        {
                            Object.keys(this.character.spells).length == 0 
                            ? <div>[None]</div>    
                            : Object.keys(this.character.spells).map((spell) => 
                                    <div>{spell} {this.character.spells[spell].rank}</div>
                                )
                        }
                    </p>
                </ion-content>
            </ion-page>
        );
    }
}
