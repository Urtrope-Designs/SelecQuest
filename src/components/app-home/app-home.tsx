import { Component, Prop, State, Event, EventEmitter } from '@stencil/core';
import { Observable } from 'rxjs/Observable';

import { AppState, Character, Task, TaskMode } from '../../helpers/models';

@Component({
    tag: 'app-home',
    styleUrl: 'app-home.scss'
})
export class AppHome {
    @Prop() appState: Observable<AppState>;

    @State() character: Character;
    @State() activeTask: Task;
    @State() activeTaskMode: TaskMode;
    @Event() taskModeAction: EventEmitter;


    componentWillLoad() {
        this.appState.subscribe((state: AppState) => {
            if (!!state.character) {
                this.character = state.character;
            }
            if (state.activeTaskMode != null) {
                this.activeTaskMode = state.activeTaskMode;
            }
            if (state.hasActiveTask) {
                this.activeTask = state.activeTask;
            }
        })
    }

    taskModeButtonClicked(newTaskModeString: string) {
        let newTaskMode;
        switch(newTaskModeString) {
            case 'LOOTING':
                newTaskMode = TaskMode.LOOTING;
                break;
            case 'GLADIATING':
                newTaskMode = TaskMode.GLADIATING;
                break;
            case 'INVESTIGATING':
                newTaskMode = TaskMode.INVESTIGATING;
                break;
        }
        this.taskModeAction.emit(newTaskMode)
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
                        Character Gold = {this.character.gold}
                    </p>
                    <p>
                        Market Saturation = {this.character.marketSaturation} / {this.character.maxMarketSaturation}
                        {
                            this.character.marketSaturation == this.character.maxMarketSaturation
                            ? <div><b>MARKET SATURATED</b></div>
                            : <br/>
                        }
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
                    <ion-button {...(this.activeTaskMode != TaskMode.LOOTING ? {color: 'light'} : {})} onClick={ () => this.taskModeButtonClicked('LOOTING')}>LOOTING</ion-button>
                    <ion-button color={this.activeTaskMode == TaskMode.GLADIATING ? 'default' : 'light'} onClick={ () => this.taskModeButtonClicked('GLADIATING')}>GLADIATING</ion-button>
                    <ion-button color={this.activeTaskMode == TaskMode.INVESTIGATING ? 'default' : 'light'} onClick={ () => this.taskModeButtonClicked('INVESTIGATING')}>INVESTIGATING</ion-button>
                </ion-content>
            </ion-page>
        );
    }
}
