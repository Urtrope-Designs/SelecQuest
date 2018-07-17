import { Component, Prop, State, Event, EventEmitter, Element } from '@stencil/core';
import { Observable } from 'rxjs/Observable';

import { AppState, Character, Task, TaskMode, AccoladeType, AffiliationType, CharConnection, CharMembership, CharOffice } from '../../helpers/models';
import {getXpRequiredForNextLevel } from '../../helpers/character-manager';
import { capitalizeInitial } from '../../helpers/utils';

@Component({
    tag: 'app-home',
    styleUrl: 'app-home.scss'
})
export class AppHome {
    @Prop() appState: Observable<AppState>;

    @Element() homeEl: HTMLElement;
    @State() character: Character;
    @State() activeTask: Task;
    @State() activeTaskProgressMs: number = 0;
    private activeTaskProgressInterval: number;
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
                clearInterval(this.activeTaskProgressInterval);
                this.activeTaskProgressMs = 0;
                this.activeTaskProgressInterval = window.setInterval((activeTask: Task) => {
                    this.activeTaskProgressMs = new Date().getTime() - activeTask.taskStartTime;
                }, 100, this.activeTask);
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
        const scrollElem = this.homeEl.querySelector('ion-content');
        scrollElem.scrollToTop(0);
    }

    findUpdate(attributeName: string, dataMatch?: (any) => boolean) {
        const found = this.character.latestModifications
            .find(mod => {
                return mod.attributeName === attributeName && (dataMatch == null || dataMatch(mod.data));
            })
        return found;
    }
    highlightOrNot(conditional) {
        return conditional ? {class: 'textRow-highlight'} : {};
    }
    highlightModifiedAttribute(attributeName: string, itemName?: string) {
        return this.highlightOrNot(!!this.findUpdate(attributeName, !!itemName ? (data) => data == itemName : null));
    }

    render() {
        return (
            <ion-page class='show-page'>
                <ion-header>
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
                </ion-header>
                <ion-content>
                    {
                        this.activeVisibleSection == VisibleSection.character 
                        ? <section>
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
                                    <tr {...this.highlightModifiedAttribute('level')}><td>Level</td><td>{this.character.level}</td></tr>
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
                                    <tr {...this.highlightModifiedAttribute('str')}><td>Str</td><td>{this.character.str}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('dex')}><td>Dex</td><td>{this.character.dex}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('con')}><td>Con</td><td>{this.character.con}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('wis')}><td>Wis</td><td>{this.character.wis}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('int')}><td>Int</td><td>{this.character.int}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('cha')}><td>Cha</td><td>{this.character.cha}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('maxHp')}><td>Max HP</td><td>{this.character.maxHp}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('maxMp')}><td>Max MP</td><td>{this.character.maxMp}</td></tr>
                                </tbody>
                            </table>
                        </section>
                        : this.activeVisibleSection == VisibleSection.actions
                        ? <section>
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
                                                <tr {...(this.highlightModifiedAttribute('spells', spell.name))}>
                                                    <td>{spell.name}</td>
                                                    <td>{spell.rank}</td>
                                                </tr>
                                            )
                                    }
                                    <tr><td colSpan={2} class="placeholderRow"></td></tr>
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
                                                <tr {...(this.highlightModifiedAttribute('abilities', ability.name))}>
                                                    <td>{ability.name}</td>
                                                    <td>{ability.rank}</td>
                                                </tr>
                                            )
                                    }
                                    <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                </tbody>
                            </table>
                        </section>
                        : this.activeVisibleSection == VisibleSection.inventory
                        ? <section>
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
                                            <tr {...this.highlightModifiedAttribute('equipment', equip.type)}>
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
                                <div sq-flex class={this.findUpdate('gold') ? 'textRow textRow-highlight' : 'textRow'}><span sq-mr-auto>Gold</span> {this.character.gold}</div>
                                <div class="textRow">Market Saturation</div>
                                <sq-progress-bar totalValue={this.character.maxMarketSaturation} currentValue={this.character.marketSaturation}></sq-progress-bar>
                                <div class="textRow">Encumbrance</div>
                                <sq-progress-bar totalValue={this.character.maxEncumbrance} currentValue={this.character.loot.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}></sq-progress-bar>
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
                                                <tr {...this.highlightModifiedAttribute('loot', item.name)}>
                                                    <td>{capitalizeInitial(item.name)}</td>
                                                    <td>{item.quantity}</td>
                                                </tr>
                                            )
                                    }
                                    <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                </tbody>
                            </table>
                        </section>
                        : this.activeVisibleSection == VisibleSection.deeds
                        ? <section>
                            <table class="listBox">
                                <thead>
                                    <tr>
                                        <th style={{width: "45%"}}>Accolades</th>
                                        <th></th>    
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.character.accolades.map(accolade =>
                                            <tr {...this.highlightModifiedAttribute('accolades', ''+accolade.type)}>
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
                                <div sq-flex class={this.findUpdate('renown') ? 'textRow textRow-highlight' : 'textRow'}><span sq-mr-auto>Renown</span> {this.character.renown}</div>
                                <div class="textRow">Fatigue</div>
                                <sq-progress-bar totalValue={this.character.maxFatigue} currentValue={this.character.fatigue}></sq-progress-bar>
                                <div class="textRow">Equipment Wear</div>
                                <sq-progress-bar totalValue={this.character.maxEquipmentWear} currentValue={this.character.trophies.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}></sq-progress-bar>
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
                                            <tr {...this.highlightModifiedAttribute('trophies', item.name)}>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                            </tr>
                                        )
                                    }
                                    <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                </tbody>
                            </table>
                        </section>
                        : this.activeVisibleSection == VisibleSection.social
                        ? <section>                    
                            <table class="listBox">
                                <thead>
                                    <tr>
                                        <th style={{width: "50%"}}>Affiliations</th>
                                        <th></th>    
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr {...this.highlightModifiedAttribute('affiliations', AffiliationType.CONNECTIONS)}>
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
                                    <tr {...this.highlightModifiedAttribute('affiliations', AffiliationType.MEMBERSHIPS)}>
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
                                    <tr {...this.highlightModifiedAttribute('affiliations', AffiliationType.OFFICES)}>
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
                                    <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                </tbody>
                            </table>
                            <p>
                                <div sq-flex class={this.findUpdate('reputation') ? 'textRow textRow-highlight' : 'textRow'}><span sq-mr-auto>Reputation</span> {this.character.reputation}</div>
                                <div class="textRow">Social Exposure</div>
                                <sq-progress-bar totalValue={this.character.maxSocialCapital} currentValue={this.character.socialExposure}></sq-progress-bar>
                                <div class="textRow">Questlog</div>
                                <sq-progress-bar totalValue={this.character.maxQuestLogSize} currentValue={this.character.leads.length}></sq-progress-bar>
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
                                        : this.character.leads.map((item, index, array) => 
                                                <tr {...this.findUpdate('leads') && index == array.length-1 ? {class: 'textRow-highlight'} : {}}><td>{item.questlogName}</td></tr>
                                            )
                                    }
                                    <tr><td class="placeholderRow"></td></tr>
                                </tbody>
                            </table>
                        </section>
                        : <section>                    
                            <p>
                                <div class="textRow">Experience</div>
                                <sq-progress-bar totalValue={getXpRequiredForNextLevel(this.character.level)} currentValue={this.character.currentXp}></sq-progress-bar>
                            </p>
                            <p>
                                <div class={this.findUpdate('currentAdventure') ? 'textRow textRow-highlight' : 'textRow'}>{this.character.currentAdventure.name}</div>
                                <sq-progress-bar totalValue={this.character.currentAdventure.progressRequired} currentValue={this.character.adventureProgress}></sq-progress-bar>
                                <table class="listBox">
                                    <thead>
                                        <tr>
                                            <th>Completed Adventures</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.character.completedAdventures.length === 0
                                            ? <tr><td>[None]</td></tr>
                                            : this.character.completedAdventures.map((adventure: string, index, array) => 
                                                <tr {...this.findUpdate('completedAdventures') && index == array.length-1 ? {class: 'textRow-highlight'} : {}}><td>{adventure}</td></tr>
                                            )
                                        }
                                        <tr><td class="placeholderRow"></td></tr>
                                    </tbody>
                                </table>
                            </p>
                        </section>
                    }
                </ion-content>

                <ion-footer>
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
                        {
                            !!this.activeTask
                            ? [<div class="textRow">{this.activeTask.description}...</div>,
                                <sq-progress-bar totalValue={this.activeTask.durationMs} currentValue={this.activeTaskProgressMs}></sq-progress-bar>]
                            : [<div class="textRow">Loading...</div>,
                                <sq-progress-bar totalValue={1} currentValue={0}></sq-progress-bar>]
                        }
                    </p>
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
    plot = "Plot",
}
