import { Component, Prop, State, Event, EventEmitter } from '@stencil/core';
import { Observable } from 'rxjs/Observable';

import { AppState, Character, Task, TaskMode, AccoladeType, AffiliationType, CharConnection, CharMembership, CharOffice } from '../../helpers/models';
import {getXpRequiredForNextLevel} from '../../helpers/character-manager';

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

                <ion-content>
                    <h1>SelecQuest</h1>
                    <p>
                        <div sq-flex><span sq-mr-auto>Name</span> {this.character.name}</div>
                        <div sq-flex><span sq-mr-auto>Race</span> {this.character.raceName}</div>
                        <div sq-flex><span sq-mr-auto>Class</span> {this.character.class}</div>
                        <div sq-flex><span sq-mr-auto>Level</span> {this.character.level}</div>
                    </p>
                    <p>
                        <div sq-flex><span sq-mr-auto>Str</span> {this.character.str}</div>
                        <div sq-flex><span sq-mr-auto>Dex</span> {this.character.dex}</div>
                        <div sq-flex><span sq-mr-auto>Con</span> {this.character.con}</div>
                        <div sq-flex><span sq-mr-auto>Wis</span> {this.character.wis}</div>
                        <div sq-flex><span sq-mr-auto>Int</span> {this.character.int}</div>
                        <div sq-flex><span sq-mr-auto>Cha</span> {this.character.cha}</div>
                        <div sq-flex><span sq-mr-auto>Max HP</span> {this.character.maxHp}</div>
                        <div sq-flex><span sq-mr-auto>Max MP</span> {this.character.maxMp}</div>
                    </p>
                    <p>
                        <div sq-flex><span sq-mr-auto>XP to next level</span> {getXpRequiredForNextLevel(this.character.level) - this.character.currentXp}</div>
                    </p>
                    <p>
                        Spells:
                        {
                            this.character.spells.length == 0 
                            ? <div>[None]</div>    
                            : this.character.spells.map((spell) => 
                                    <div sq-flex><span sq-mr-auto>{spell.name}</span> {spell.rank}</div>
                                )
                        }
                    </p>
                    <p>
                        Abilities:
                        {
                            this.character.abilities.length == 0 
                            ? <div>[None]</div>    
                            : this.character.abilities.map((ability) => 
                                    <div sq-flex><span sq-mr-auto>{ability.name}</span> {ability.rank}</div>
                                )
                        }
                    </p>
                    <p>
                        <div sq-flex><span sq-mr-auto>Gold</span> {this.character.gold}</div>
                        <div sq-flex>
                            <span sq-mr-auto>Market Saturation</span> {this.character.marketSaturation} / {this.character.maxMarketSaturation}
                            {
                                this.character.marketSaturation >= this.character.maxMarketSaturation
                                ? <div><b>MARKET SATURATED</b></div>
                                : <br/>
                            }
                        </div>
                        <div sq-flex><span sq-mr-auto>Encumbrance</span> {this.character.loot.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)} / {this.character.maxEncumbrance}</div>
                        {
                            this.character.loot.length == 0
                            ? <div>[None]</div>
                            : this.character.loot.map((item) => 
                                    <div sq-flex><span sq-mr-auto>{item.name}</span> {item.quantity}</div>
                                )
                        }
                    </p>
                    <p>
                        <div sq-flex><span sq-mr-auto>Renown</span> {this.character.renown}</div>
                        <div sq-flex>
                            <span sq-mr-auto>Fatigue</span> {this.character.fatigue} / {this.character.maxFatigue}
                            {
                                this.character.fatigue >= this.character.maxFatigue
                                ? <div><b>FATIGUED</b></div>
                                : <br/>
                            }
                        </div>
                        <div sq-flex><span sq-mr-auto>Equipment Wear</span> {this.character.trophies.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)} / {this.character.maxEquipmentWear}</div>
                        {
                            this.character.trophies.length == 0
                            ? <div>[None]</div>
                            : this.character.trophies.map((item) => 
                                    <div sq-flex><span sq-mr-auto>{item.name}</span> {item.quantity}</div>
                                )
                        }
                    </p>
                    <p>
                        <div sq-flex><span sq-mr-auto>Reputation</span> {this.character.reputation}</div>
                        <div sq-flex>
                            <span sq-mr-auto>Social Exposure</span> {this.character.socialExposure} / {this.character.maxSocialCapital}
                            {
                                this.character.socialExposure >= this.character.maxSocialCapital
                                ? <div><b>OVEREXPOSED</b></div>
                                : <br/>
                            }
                        </div>
                        <div sq-flex><span sq-mr-auto>Questlog</span> {this.character.leads.length} / {this.character.maxQuestLogSize}</div>
                        {
                            this.character.leads.length == 0
                            ? <div>[None]</div>
                            : this.character.leads.map((item) => 
                                    <div>{item.questlogName}</div>
                                )
                        }
                    </p>
                    <p>
                        Equipment:
                        {
                            this.character.equipment.map(equip => 
                                <div sq-flex>
                                    <span sq-mr-auto>{equip.type}</span>&nbsp;
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
                                <div sq-flex>
                                    <span sq-mr-auto>{AccoladeType[accolade.type]}</span>&nbsp;
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
                        <div sq-flex>
                            <span sq-mr-auto>{AffiliationType.CONNECTIONS}</span>&nbsp;
                            {
                                this.character.affiliations[AffiliationType.CONNECTIONS].length <= 0
                                ? <span>[None]</span>
                                : <span>{
                                    this.character.affiliations[AffiliationType.CONNECTIONS]
                                        .map((connection: CharConnection) => {
                                            return `${connection.affiliatedPersonName}, ${connection.affiliatedPersonTitle} for ${connection.affiliatedGroupName}`;
                                        })
                                        .join(', ')
                                }</span>
                            }
                        </div>
                        <div sq-flex>
                            <span sq-mr-auto>{AffiliationType.MEMBERSHIPS}</span>&nbsp;
                            {
                                this.character.affiliations[AffiliationType.MEMBERSHIPS].length <= 0
                                ? <span>[None]</span>
                                : <span>{
                                    this.character.affiliations[AffiliationType.MEMBERSHIPS]
                                        .map((membership: CharMembership) => membership.affiliatedGroupName)
                                        .join(', ')
                                }</span>
                            }
                        </div>
                        <div sq-flex>
                            <span sq-mr-auto>{AffiliationType.OFFICES}</span>&nbsp;
                            {
                                this.character.affiliations[AffiliationType.OFFICES].length <= 0
                                ? <span>[None]</span>
                                : <span>{
                                    this.character.affiliations[AffiliationType.OFFICES]
                                        .map((office: CharOffice) => {
                                            return `${office.officeTitleDescription} for ${office.affiliatedGroupName}`;
                                        })
                                        .join(', ')
                                }</span>
                            }
                        </div>
                    </p>
                    <p>
                        <div sq-flex><span sq-mr-auto>Current Adventure</span> {this.character.currentAdventure.name}</div>
                        <div sq-flex><span sq-mr-auto>Adventure Progress</span> {this.character.adventureProgress} / {this.character.currentAdventure.progressRequired}</div>
                    </p>
                    <ion-button {...(this.activeTaskMode != TaskMode.LOOTING ? {color: 'light'} : {})} onClick={ () => this.taskModeButtonClicked('LOOTING')}>LOOTING</ion-button>
                    <ion-button color={this.activeTaskMode == TaskMode.GLADIATING ? 'default' : 'light'} onClick={ () => this.taskModeButtonClicked('GLADIATING')}>GLADIATING</ion-button>
                    <ion-button color={this.activeTaskMode == TaskMode.INVESTIGATING ? 'default' : 'light'} onClick={ () => this.taskModeButtonClicked('INVESTIGATING')}>INVESTIGATING</ion-button>
                </ion-content>

                <ion-footer>
                    <ion-toolbar>
                        <p>
                            Current Task:
                            {
                                !!this.activeTask
                                ? <div>{this.activeTask.description}...</div>
                                : <div>Loading...</div>
                            }
                        </p>
                    </ion-toolbar>
                </ion-footer>
            </ion-page>
        );
    }
}
