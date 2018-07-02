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
    @State() activeVisibleSection: VisibleSection;
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
        });
        this.activeVisibleSection = VisibleSection.character;
    }

    taskModeButtonClicked(newTaskModeString: TaskMode) {
        let newTaskMode;
        switch(newTaskModeString) {
            case TaskMode.LOOTING:
                newTaskMode = TaskMode.LOOTING;
                break;
            case TaskMode.GLADIATING:
                newTaskMode = TaskMode.GLADIATING;
                break;
            case TaskMode.INVESTIGATING:
                newTaskMode = TaskMode.INVESTIGATING;
                break;
        }
        this.taskModeAction.emit(newTaskMode)
    }

    visibleSectionButtonClicked(newVisibleSection: VisibleSection) {
        this.activeVisibleSection = newVisibleSection;
    }

    render() {
        return (
            <ion-page class='show-page'>

                <ion-content>
                    <h1>SelecQuest</h1>
                    <div class="buttonRow">
                        {
                            Object.keys(VisibleSection).map(sectionName => 
                                <button 
                                    {...(this.activeVisibleSection == VisibleSection[sectionName] ? {class: 'selected'} : {})}
                                    onClick={ () => this.visibleSectionButtonClicked(VisibleSection[sectionName])}
                                >
                                    {VisibleSection[sectionName]}
                                </button>
                            )
                        }
                    </div>
                    <section class={this.activeVisibleSection == VisibleSection.character ? 'charSheetSection charSheetSection-selected' : 'charSheetSection'}>
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
                                <tr><td>Str</td><td>{this.character.str}</td></tr>
                                <tr><td>Dex</td><td>{this.character.dex}</td></tr>
                                <tr><td>Con</td><td>{this.character.con}</td></tr>
                                <tr><td>Wis</td><td>{this.character.wis}</td></tr>
                                <tr><td>Int</td><td>{this.character.int}</td></tr>
                                <tr><td>Cha</td><td>{this.character.cha}</td></tr>
                                <tr><td>Max HP</td><td>{this.character.maxHp}</td></tr>
                                <tr><td>Max MP</td><td>{this.character.maxMp}</td></tr>
                            </tbody>
                        </table>
                    </section>
                    <section class={this.activeVisibleSection == VisibleSection.actions ? 'charSheetSection charSheetSection-selected' : 'charSheetSection'}>
                        <table class="listBox">
                            <thead>
                                <tr>
                                    <th style={{width: "65%"}}>Spells</th>
                                    <th>Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.character.spells.length == 0 
                                    ? <tr><td colSpan={2}>[None]</td></tr>    
                                    : this.character.spells.map((spell) => 
                                            <tr>
                                                <td>{spell.name}</td>
                                                <td>{spell.rank}</td>
                                            </tr>
                                        )
                                }
                            </tbody>
                        </table>
                        <table class="listBox">
                            <thead>
                                <tr>
                                    <th style={{width: "65%"}}>Abilities</th>
                                    <th>Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.character.abilities.length == 0 
                                    ? <tr><td colSpan={2}>[None]</td></tr>    
                                    : this.character.abilities.map((ability) => 
                                            <tr>
                                                <td>{ability.name}</td>
                                                <td>{ability.rank}</td>
                                            </tr>
                                        )
                                }
                            </tbody>
                        </table>
                    </section>
                    <section class={this.activeVisibleSection == VisibleSection.inventory ? 'charSheetSection charSheetSection-selected' : 'charSheetSection'}>
                        <table class="listBox">
                            <thead>
                                <tr>
                                    <th style={{width:"43%"}}>Equipment</th>
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
                        <p>
                            <div sq-flex class="textRow"><span sq-mr-auto>Gold</span> {this.character.gold}</div>
                            <div sq-flex class="textRow">
                                <span sq-mr-auto>Market Saturation</span> {this.character.marketSaturation} / {this.character.maxMarketSaturation}
                            </div>
                            <div sq-flex class="textRow"><span sq-mr-auto>Encumbrance</span> {this.character.loot.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)} / {this.character.maxEncumbrance}</div>
                        </p>
                        <table class="listBox">
                            <thead>
                                <tr>
                                    <th style={{width: "65%"}}>Loot</th>
                                    <th>Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.character.loot.length == 0
                                    ? <tr><td colSpan={2}>[None]</td></tr>
                                    : this.character.loot.map((item) => 
                                            <tr>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                            </tr>
                                        )
                                }
                            </tbody>
                        </table>
                    </section>
                    <section class={this.activeVisibleSection == VisibleSection.deeds ? 'charSheetSection charSheetSection-selected' : 'charSheetSection'}>
                        <table class="listBox">
                            <thead>
                                <tr>
                                    <th style={{width: "43%"}}>Accolades</th>
                                    <th></th>    
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.character.accolades.map(accolade =>
                                        <tr>
                                            <td>{AccoladeType[accolade.type]}</td>
                                            {
                                                accolade.received.length <= 0
                                                ? <td>[None]</td>
                                                : <td>{accolade.received.join(', ')}</td>
                                            }
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                        <p>
                            <div sq-flex class="textRow"><span sq-mr-auto>Renown</span> {this.character.renown}</div>
                            <div sq-flex class="textRow">
                                <span sq-mr-auto>Fatigue</span> {this.character.fatigue} / {this.character.maxFatigue}
                            </div>
                            <div sq-flex class="textRow"><span sq-mr-auto>Equipment Wear</span> {this.character.trophies.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)} / {this.character.maxEquipmentWear}</div>
                        </p>    
                        <table class="listBox">
                            <thead>
                                <tr>
                                    <td style={{width: "65%"}}>Trophies</td>
                                    <td>Qty</td>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.character.trophies.length == 0
                                    ? <tr><td colSpan={2}>[None]</td></tr>
                                    : this.character.trophies.map((item) => 
                                        <tr>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </section>
                    <section class={this.activeVisibleSection == VisibleSection.social ? 'charSheetSection charSheetSection-selected' : 'charSheetSection'}>                    
                        <table class="listBox">
                            <thead>
                                <tr>
                                    <th style={{width: "50%"}}>Affiliations</th>
                                    <th></th>    
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{AffiliationType.CONNECTIONS}</td>
                                    {
                                        this.character.affiliations[AffiliationType.CONNECTIONS].length <= 0
                                        ? <td>[None]</td>
                                        : <td>{
                                            this.character.affiliations[AffiliationType.CONNECTIONS]
                                                .map((connection: CharConnection) => {
                                                    return `${connection.affiliatedPersonName}, ${connection.affiliatedPersonTitle} for ${connection.affiliatedGroupName}`;
                                                })
                                                .join(', ')
                                        }</td>
                                    }
                                </tr>
                                <tr>
                                    <td>{AffiliationType.MEMBERSHIPS}</td>
                                    {
                                        this.character.affiliations[AffiliationType.MEMBERSHIPS].length <= 0
                                        ? <td>[None]</td>
                                        : <td>{
                                            this.character.affiliations[AffiliationType.MEMBERSHIPS]
                                                .map((membership: CharMembership) => membership.affiliatedGroupName)
                                                .join(', ')
                                        }</td>
                                    }
                                </tr>
                                <tr>
                                    <td>{AffiliationType.OFFICES}</td>
                                    {
                                        this.character.affiliations[AffiliationType.OFFICES].length <= 0
                                        ? <td>[None]</td>
                                        : <td>{
                                            this.character.affiliations[AffiliationType.OFFICES]
                                                .map((office: CharOffice) => {
                                                    return `${office.officeTitleDescription} for ${office.affiliatedGroupName}`;
                                                })
                                                .join(', ')
                                        }</td>
                                    }
                                </tr>
                            </tbody>
                        </table>
                        <p>
                            <div sq-flex class="textRow"><span sq-mr-auto>Reputation</span> {this.character.reputation}</div>
                            <div sq-flex class="textRow">
                                <span sq-mr-auto>Social Exposure</span> {this.character.socialExposure} / {this.character.maxSocialCapital}
                            </div>
                            <div sq-flex class="textRow"><span sq-mr-auto>Questlog</span> {this.character.leads.length} / {this.character.maxQuestLogSize}</div>
                        </p>
                        <table class="listBox">
                            <thead>
                                <tr>
                                    <td>Quests</td>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.character.leads.length == 0
                                    ? <tr><td>[None]</td></tr>
                                    : this.character.leads.map((item) => 
                                            <tr><td>{item.questlogName}</td></tr>
                                        )
                                }
                            </tbody>
                        </table>
                    </section>
                    <section class={this.activeVisibleSection == VisibleSection.progress ? 'charSheetSection charSheetSection-selected' : 'charSheetSection'}>                    
                        <p>
                            <div sq-flex class="textRow"><span sq-mr-auto>XP to next level</span> {getXpRequiredForNextLevel(this.character.level) - this.character.currentXp}</div>
                        </p>
                        <p>
                            <div sq-flex class="textRow"><span sq-mr-auto>Current Adventure</span> {this.character.currentAdventure.name}</div>
                            <div sq-flex class="textRow"><span sq-mr-auto>Adventure Progress</span> {this.character.adventureProgress} / {this.character.currentAdventure.progressRequired}</div>
                        </p>
                    </section>
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
                        <div class="buttonRow">
                            <button {...(this.activeTaskMode != TaskMode.LOOTING ? {} : {class: 'selected'})} onClick={ () => this.taskModeButtonClicked(TaskMode.LOOTING)}>Looting</button>
                            <button {...(this.activeTaskMode == TaskMode.GLADIATING ? {class: 'selected'} : {})} onClick={ () => this.taskModeButtonClicked(TaskMode.GLADIATING)}>Gladiating</button>
                            <button {...(this.activeTaskMode == TaskMode.INVESTIGATING ? {class: 'selected'} : {})} onClick={ () => this.taskModeButtonClicked(TaskMode.INVESTIGATING)}>Investigating</button>
                        </div>
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

enum VisibleSection {
    character = "Character",
    inventory = "Inventory",
    deeds = "Deeds",
    social = "Social",
    actions = "Actions",
    progress = "Progress",
}
