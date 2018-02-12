import { Component, Prop, State } from '@stencil/core';
import { Observable } from 'rxjs/Observable';

import { AppState, Character, Task } from '../../helpers/models';

@Component({
    tag: 'app-home',
    styleUrl: 'app-home.scss'
})
export class AppHome {
    @Prop() appState: Observable<AppState>;

    @State() character: Character;
    @State() activeTask: Task;

    componentWillLoad() {
        this.appState.subscribe((state: AppState) => {
            if (!!state.character) {
                this.character = state.character;
            }
            if (state.hasActiveTask) {
                this.activeTask = state.activeTask;
            }
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
                    <p>
                        Loot: {Object.keys(this.character.loot).reduce((prevVal, curVal) => {return prevVal + this.character.loot[curVal].quantity}, 0)}
                        {
                            Object.keys(this.character.loot).length == 0
                            ? <div>[None]</div>
                            : Object.keys(this.character.loot).map((item) => 
                                    <div>{item} {this.character.loot[item].quantity}</div>
                                )
                        }
                    </p>
                    <br/>
                    <p>
                        Current Task:
                        {
                            !!this.activeTask
                            ? <div>{this.activeTask.description}</div>
                            : <div>Loading...</div>
                        }
                        
                    </p>
                </ion-content>
            </ion-page>
        );
    }
}
