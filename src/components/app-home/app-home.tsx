import { Component, Prop, State, Event, EventEmitter } from '@stencil/core';
import { Observable } from 'rxjs/Observable';

import { AppState, Character, Task, TaskType } from '../../helpers/models';

@Component({
    tag: 'app-home',
    styleUrl: 'app-home.scss'
})
export class AppHome {
    @Prop() appState: Observable<AppState>;

    @State() character: Character;
    @State() activeTask: Task;
    @State() activeTaskType: TaskType;
    @Event() taskTypeAction: EventEmitter;


    componentWillLoad() {
        this.appState.subscribe((state: AppState) => {
            if (!!state.character) {
                this.character = state.character;
            }
            if (state.activeTaskType != null) {
                this.activeTaskType = state.activeTaskType;
            }
            if (state.hasActiveTask) {
                this.activeTask = state.activeTask;
            }
        })
    }

    taskTypeButtonClicked(newTaskTypeString: string) {
        let newTaskType;
        switch(newTaskTypeString) {
            case 'LOOTING':
                newTaskType = TaskType.LOOTING;
                break;
            case 'GLADIATING':
                newTaskType = TaskType.GLADIATING;
                break;
            case 'INVESTIGATING':
                newTaskType = TaskType.INVESTIGATING;
                break;
        }
        this.taskTypeAction.emit(newTaskType)
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
                    <ion-button {...(this.activeTaskType != TaskType.LOOTING ? {color: 'light'} : {})} onClick={ () => this.taskTypeButtonClicked('LOOTING')}>LOOTING</ion-button>
                    <ion-button color={this.activeTaskType == TaskType.GLADIATING ? 'default' : 'light'} onClick={ () => this.taskTypeButtonClicked('GLADIATING')}>GLADIATING</ion-button>
                    <ion-button color={this.activeTaskType == TaskType.INVESTIGATING ? 'default' : 'light'} onClick={ () => this.taskTypeButtonClicked('INVESTIGATING')}>INVESTIGATING</ion-button>
                </ion-content>
            </ion-page>
        );
    }
}
