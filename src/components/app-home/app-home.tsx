import { Component, Prop, State, Event, EventEmitter } from '@stencil/core';
import { Observable } from 'rxjs/Observable';

import { AppState, Character, Task, TaskMode, AccoladeType, AffiliationType } from '../../helpers/models';

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
                        <div>Str: {this.character.str}</div>
                        <div>Dex: {this.character.dex}</div>
                        <div>Con: {this.character.con}</div>
                        <div>Wis: {this.character.wis}</div>
                        <div>Int: {this.character.int}</div>
                        <div>Cha: {this.character.cha}</div>
                    </p>
                    <p>
                        <div>Gold = {this.character.gold}</div>
                        <div>Renown = {this.character.renown}</div>
                        <div>Reputation = {this.character.reputation}</div>
                    </p>
                    <p>
                        <div>
                            Market Saturation = {this.character.marketSaturation} / {this.character.maxMarketSaturation}
                            {
                                this.character.marketSaturation >= this.character.maxMarketSaturation
                                ? <div><b>MARKET SATURATED</b></div>
                                : <br/>
                            }
                        </div>
                        <div>
                            Fatigue = {this.character.fatigue} / {this.character.maxFatigue}
                            {
                                this.character.fatigue >= this.character.maxFatigue
                                ? <div><b>FATIGUED</b></div>
                                : <br/>
                            }
                        </div>
                        <div>
                            Social Exposure = {this.character.socialExposure} / {this.character.maxSocialCapital}
                            {
                                this.character.socialExposure >= this.character.maxSocialCapital
                                ? <div><b>OVEREXPOSED</b></div>
                                : <br/>
                            }
                        </div>
                    </p>

                    <p>
                        Spells:
                        {
                            this.character.spells.length == 0 
                            ? <div>[None]</div>    
                            : this.character.spells.map((spell) => 
                                    <div>{spell.name} {spell.rank}</div>
                                )
                        }
                    </p>
                    <p>
                        Encumbrance: {this.character.loot.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)} / {this.character.maxEncumbrance}
                        {
                            this.character.loot.length == 0
                            ? <div>[None]</div>
                            : this.character.loot.map((item) => 
                                    <div>{item.name} {item.quantity}</div>
                                )
                        }
                    </p>
                    <p>
                        Equipment Wear: {this.character.trophies.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)} / {this.character.maxEquipmentIntegrity}
                        {
                            this.character.trophies.length == 0
                            ? <div>[None]</div>
                            : this.character.trophies.map((item) => 
                                    <div>{item.name} {item.quantity}</div>
                                )
                        }
                    </p>
                    <p>
                        Questlog: {this.character.leads.length} / {this.character.maxQuestLogSize}
                        {
                            this.character.leads.length == 0
                            ? <div>[None]</div>
                            : this.character.leads.map((item) => 
                                    <div>{item.name}</div>
                                )
                        }
                    </p>
                    <p>
                        Equipment:
                        {
                            this.character.equipment.map(equip => 
                                <div>
                                    {equip.type}:&nbsp;
                                    {
                                        !!equip.description
                                        ? <span>{equip.description}</span>
                                        : <span>[None]</span>
                                    }
                                </div>
                            )
                        }
                    </p>
                    <p>
                        Accolades:
                        {
                            this.character.accolades.map(accolade =>
                                <div>
                                    {AccoladeType[accolade.type]}:&nbsp;
                                    {
                                        accolade.received.length <= 0
                                        ? <span>[None]</span>
                                        : <span>{accolade.received.join(', ')}</span>
                                    }
                                </div>
                            )
                        }
                    </p>
                    <p>
                        Affiliations:
                        {
                            this.character.affiliations.map(affiliation =>
                                <div>
                                    {AffiliationType[affiliation.type]}:&nbsp;
                                    {
                                        affiliation.received.length <= 0
                                        ? <span>[None]</span>
                                        : <span>{affiliation.received.join(', ')}</span>
                                    }
                                </div>
                            )
                        }
                    </p>

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
