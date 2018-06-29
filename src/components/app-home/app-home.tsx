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
                    <table class="listBox">
                        <thead>
                            <tr>
                                <th style={{width: "35%"}}>Trait</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Name</td><td>{this.character.name}</td></tr>
                            <tr><td>Race</td><td>{this.character.raceName}</td></tr>
                            <tr><td>Class</td><td>{this.character.class}</td></tr>
                            <tr><td>Level</td><td>{this.character.level}</td></tr>
                        </tbody>
                    </table>
                    <table class="listBox">
                        <thead>
                            <tr>
                                <th style={{width: "65%"}}>Stat</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td sq-mr-auto>Str</td><td>{this.character.str}</td></tr>
                            <tr><td sq-mr-auto>Dex</td><td>{this.character.dex}</td></tr>
                            <tr><td sq-mr-auto>Con</td><td>{this.character.con}</td></tr>
                            <tr><td sq-mr-auto>Wis</td><td>{this.character.wis}</td></tr>
                            <tr><td sq-mr-auto>Int</td><td>{this.character.int}</td></tr>
                            <tr><td sq-mr-auto>Cha</td><td>{this.character.cha}</td></tr>
                            <tr><td sq-mr-auto>Max HP</td><td>{this.character.maxHp}</td></tr>
                            <tr><td sq-mr-auto>Max MP</td><td>{this.character.maxMp}</td></tr>
                        </tbody>
                    </table>
                    <p>
                        <div sq-flex class="textRow"><span sq-mr-auto>XP to next level</span> {getXpRequiredForNextLevel(this.character.level) - this.character.currentXp}</div>
                    </p>
                    <p class="listBox">
                        <div sq-flex class="item-highlight textRow">
                            <span sq-mr-auto>Spells</span>
                            <span>Rank</span>
                        </div>
                        {
                            this.character.spells.length == 0 
                            ? <div class="textRow">[None]</div>    
                            : this.character.spells.map((spell) => 
                                    <div sq-flex class="textRow"><span sq-mr-auto>{spell.name}</span> {spell.rank}</div>
                                )
                        }
                    </p>
                    <p class="listBox">
                        <div sq-flex class="item-highlight textRow">
                            <span sq-mr-auto>Abilities</span>
                            <span>Rank</span>
                        </div>
                        {
                            this.character.abilities.length == 0 
                            ? <div class="textRow">[None]</div>    
                            : this.character.abilities.map((ability) => 
                                    <div sq-flex class="textRow"><span sq-mr-auto>{ability.name}</span> {ability.rank}</div>
                                )
                        }
                    </p>
                    <p>
                        <div sq-flex class="textRow"><span sq-mr-auto>Gold</span> {this.character.gold}</div>
                        <div sq-flex class="textRow">
                            <span sq-mr-auto>Market Saturation</span> {this.character.marketSaturation} / {this.character.maxMarketSaturation}
                        </div>
                        <div sq-flex class="textRow"><span sq-mr-auto>Encumbrance</span> {this.character.loot.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)} / {this.character.maxEncumbrance}</div>
                        <div class="listBox">
                            <div sq-flex class="item-highlight textRow">
                                <span sq-mr-auto>Loot</span>
                                <span>Qty</span>
                            </div>
                            {
                                this.character.loot.length == 0
                                ? <div class="textRow">[None]</div>
                                : this.character.loot.map((item) => 
                                        <div sq-flex class="textRow"><span sq-mr-auto>{item.name}</span> {item.quantity}</div>
                                    )
                            }
                        </div>
                    </p>
                    <p>
                        <div sq-flex class="textRow"><span sq-mr-auto>Renown</span> {this.character.renown}</div>
                        <div sq-flex class="textRow">
                            <span sq-mr-auto>Fatigue</span> {this.character.fatigue} / {this.character.maxFatigue}
                        </div>
                        <div sq-flex class="textRow"><span sq-mr-auto>Equipment Wear</span> {this.character.trophies.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)} / {this.character.maxEquipmentWear}</div>
                        <div class="listBox">
                            <div sq-flex class="item-highlight textRow">
                                <span sq-mr-auto>Trophies</span>
                                <span>Qty</span>
                            </div>
                            {
                                this.character.trophies.length == 0
                                ? <div class="textRow">[None]</div>
                                : this.character.trophies.map((item) => 
                                    <div sq-flex class="textRow"><span sq-mr-auto>{item.name}</span> {item.quantity}</div>
                                )
                            }
                        </div>
                    </p>
                    <p>
                        <div sq-flex class="textRow"><span sq-mr-auto>Reputation</span> {this.character.reputation}</div>
                        <div sq-flex class="textRow">
                            <span sq-mr-auto>Social Exposure</span> {this.character.socialExposure} / {this.character.maxSocialCapital}
                        </div>
                        <div sq-flex class="textRow"><span sq-mr-auto>Questlog</span> {this.character.leads.length} / {this.character.maxQuestLogSize}</div>
                        <div class="listBox">
                            <div sq-flex class="item-highlight textRow">
                                <span sq-mr-auto>Quests</span>
                            </div>
                            {
                                this.character.leads.length == 0
                                ? <div class="textRow">[None]</div>
                                : this.character.leads.map((item) => 
                                        <div class="textRow">{item.questlogName}</div>
                                    )
                            }
                        </div>
                    </p>
                    <table class="listBox">
                        <thead>
                            <tr>
                                <th style={{width:"40%"}}>Equipment</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.character.equipment.map(equip => 
                                    <tr class="textRow">
                                        <td style={{width: "40%"}}>{equip.type}</td>
                                        {
                                            !!equip.description
                                            ? <td>{equip.description}</td>
                                            : <td>[None]</td>
                                        }
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                    <p class="listBox">
                        <div sq-flex class="item-highlight textRow">Accolades</div>
                        {
                            this.character.accolades.map(accolade =>
                                <div sq-flex class="textRow">
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
                    <p class="listBox">
                        <div sq-flex class="item-highlight textRow">Affiliations</div>
                        <div sq-flex class="textRow">
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
                        <div sq-flex class="textRow">
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
                        <div sq-flex class="textRow">
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
                        <div sq-flex class="textRow"><span sq-mr-auto>Current Adventure</span> {this.character.currentAdventure.name}</div>
                        <div sq-flex class="textRow"><span sq-mr-auto>Adventure Progress</span> {this.character.adventureProgress} / {this.character.currentAdventure.progressRequired}</div>
                    </p>
                    <ion-button {...(this.activeTaskMode != TaskMode.LOOTING ? {color: 'light'} : {})} onClick={ () => this.taskModeButtonClicked('LOOTING')}>LOOTING</ion-button>
                    <ion-button color={this.activeTaskMode == TaskMode.GLADIATING ? 'default' : 'light'} onClick={ () => this.taskModeButtonClicked('GLADIATING')}>GLADIATING</ion-button>
                    <ion-button color={this.activeTaskMode == TaskMode.INVESTIGATING ? 'default' : 'light'} onClick={ () => this.taskModeButtonClicked('INVESTIGATING')}>INVESTIGATING</ion-button>
                </ion-content>

                <ion-footer>
                    <ion-toolbar>
                        {
                            this.character.marketSaturation >= this.character.maxMarketSaturation
                            ? <div class="textRow"><b>MARKET SATURATED</b></div>
                            : this.character.fatigue >= this.character.maxFatigue
                                ? <div class="textRow"><b>FATIGUED</b></div>
                                : this.character.socialExposure >= this.character.maxSocialCapital
                                    ? <div class="textRow"><b>OVEREXPOSED</b></div>
                                    : <br/>
                        }
                        <p>
                            <div class="textRow">Current Task</div>
                            {
                                !!this.activeTask
                                ? <div class="textRow">{this.activeTask.description}...</div>
                                : <div class="textRow">Loading...</div>
                            }
                        </p>
                    </ion-toolbar>
                </ion-footer>
            </ion-page>
        );
    }
}
