import { Component, Prop, State, Event, EventEmitter, Element } from '@stencil/core';
import { Observable } from 'rxjs/Observable';

import { AppState, Hero, Task, TaskMode, AccoladeType, AffiliationType, CharConnection, CharMembership, CharOffice } from '../../helpers/models';
import { getXpRequiredForNextLevel } from '../../helpers/hero-manager';
import { capitalizeInitial, getRoughTime } from '../../helpers/utils';

@Component({
    tag: 'sq-play-screen',
    styleUrl: 'play-screen.scss'
})
export class PlayScreen {
    @Prop() appState: Observable<AppState>;

    @Element() homeEl: HTMLElement;
    @State() hero: Hero;
    @State() activeTask: Task;
    @State() activeTaskProgressMs: number = 0;
    private activeTaskProgressInterval: number;
    @State() activeTaskMode: TaskMode;
    @State() activeVisibleSection: VisibleSection;
    @Event() taskModeAction: EventEmitter;


    componentWillLoad() {
        this.appState.subscribe((state: AppState) => {
            if (!!state.hero) {
                this.hero = state.hero;
            }
            if (state.activeTaskMode != null) {
                this.activeTaskMode = state.activeTaskMode;
            }
            if (state.hasActiveTask) {
                this.activeTask = state.activeTask;
                clearInterval(this.activeTaskProgressInterval);
                this.activeTaskProgressMs = new Date().getTime() - this.activeTask.taskStartTime;
                this.activeTaskProgressInterval = window.setInterval((activeTask: Task) => {
                    this.activeTaskProgressMs = new Date().getTime() - activeTask.taskStartTime;
                }, 100, this.activeTask);
            }
        });
        this.activeVisibleSection = VisibleSection.hero;
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
        const contentElem = this.homeEl.querySelector('ion-content');
        contentElem.getScrollElement().scrollToTop(0);
    }

    findUpdate(attributeName: string, dataMatch?: (any) => boolean) {
        const found = this.hero.latestModifications
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
            <ion-page class='ion-page show-page'>
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
                        this.activeVisibleSection == VisibleSection.hero 
                        ? <section>
                            <table class="listBox">
                                <thead>
                                    <tr>
                                        <th style={{width: "35%"}}>Trait</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>Name</td><td>{this.hero.name}</td></tr>
                                    <tr><td>Race</td><td>{this.hero.raceName}</td></tr>
                                    <tr><td>Class</td><td>{this.hero.class}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('level')}><td>Level</td><td>{this.hero.level}</td></tr>
                                    <tr><td colSpan={2} class="placeholderRow"></td></tr>
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
                                    <tr {...this.highlightModifiedAttribute('str')}><td>Str</td><td>{this.hero.str}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('dex')}><td>Dex</td><td>{this.hero.dex}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('con')}><td>Con</td><td>{this.hero.con}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('wis')}><td>Wis</td><td>{this.hero.wis}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('int')}><td>Int</td><td>{this.hero.int}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('cha')}><td>Cha</td><td>{this.hero.cha}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('maxHp')}><td>Max HP</td><td>{this.hero.maxHp}</td></tr>
                                    <tr {...this.highlightModifiedAttribute('maxMp')}><td>Max MP</td><td>{this.hero.maxMp}</td></tr>
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
                                        this.hero.spells.length == 0 
                                        ? <tr><td colSpan={2}>[None]</td></tr>    
                                        : this.hero.spells.map((spell) => 
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
                                        this.hero.abilities.length == 0 
                                        ? <tr><td colSpan={2}>[None]</td></tr>    
                                        : this.hero.abilities.map((ability) => 
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
                                        this.hero.equipment.map(equip => 
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
                                <div sq-flex class={this.findUpdate('gold') ? 'textRow textRow-highlight' : 'textRow'}><span sq-mr-auto>Gold</span> {this.hero.gold}</div>
                                <div class="textRow">Market Saturation</div>
                                <sq-progress-bar
                                    totalValue={this.hero.maxMarketSaturation}
                                    currentValue={this.hero.marketSaturation}
                                    tapOverlayText={`${Math.floor(100 * this.hero.marketSaturation / this.hero.maxMarketSaturation)}%`}
                                ></sq-progress-bar>
                                <div class="textRow">Encumbrance</div>
                                <sq-progress-bar
                                    totalValue={this.hero.maxEncumbrance}
                                    currentValue={this.hero.loot.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}
                                    tapOverlayText={`${this.hero.loot.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}/${this.hero.maxEncumbrance}`}
                                ></sq-progress-bar>
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
                                        this.hero.loot.length == 0
                                        ? <tr><td colSpan={2}>[None]</td></tr>
                                        : this.hero.loot.map((item) => 
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
                                        this.hero.accolades.map(accolade =>
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
                                    <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                </tbody>
                            </table>
                            <p>
                                <div sq-flex class={this.findUpdate('renown') ? 'textRow textRow-highlight' : 'textRow'}><span sq-mr-auto>Renown</span> {this.hero.renown}</div>
                                <div class="textRow">Fatigue</div>
                                <sq-progress-bar
                                    totalValue={this.hero.maxFatigue}
                                    currentValue={this.hero.fatigue}
                                    tapOverlayText={`${Math.floor(100 * this.hero.fatigue / this.hero.maxFatigue)}%`}
                                ></sq-progress-bar>
                                <div class="textRow">Equipment Wear</div>
                                <sq-progress-bar
                                    totalValue={this.hero.maxEquipmentWear}
                                    currentValue={this.hero.trophies.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}
                                    tapOverlayText={`${this.hero.trophies.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}/${this.hero.maxEquipmentWear}`}
                                ></sq-progress-bar>
                            </p>    
                            <table class="listBox">
                                <thead>
                                    <tr>
                                        <th style={{width: "65%"}}>Trophies</th>
                                        <th>Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.hero.trophies.length == 0
                                        ? <tr><td colSpan={2}>[None]</td></tr>
                                        : this.hero.trophies.map((item) => 
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
                                            this.hero.affiliations[AffiliationType.CONNECTIONS].length <= 0
                                            ? <td>[None]</td>
                                            : <td>{
                                                this.hero.affiliations[AffiliationType.CONNECTIONS]
                                                    .map((connection: CharConnection) => {
                                                        return `${connection.affiliatedPersonName}, ${connection.affiliatedPersonTitle} for ${connection.affiliatedGroupName}`;
                                                    })
                                                    .join('; ')
                                            }</td>
                                        }
                                    </tr>
                                    <tr {...this.highlightModifiedAttribute('affiliations', AffiliationType.MEMBERSHIPS)}>
                                        <td>{AffiliationType.MEMBERSHIPS}</td>
                                        {
                                            this.hero.affiliations[AffiliationType.MEMBERSHIPS].length <= 0
                                            ? <td>[None]</td>
                                            : <td>{
                                                this.hero.affiliations[AffiliationType.MEMBERSHIPS]
                                                    .map((membership: CharMembership) => capitalizeInitial(membership.affiliatedGroupName))
                                                    .join('; ')
                                            }</td>
                                        }
                                    </tr>
                                    <tr {...this.highlightModifiedAttribute('affiliations', AffiliationType.OFFICES)}>
                                        <td>{AffiliationType.OFFICES}</td>
                                        {
                                            this.hero.affiliations[AffiliationType.OFFICES].length <= 0
                                            ? <td>[None]</td>
                                            : <td>{
                                                this.hero.affiliations[AffiliationType.OFFICES]
                                                    .map((office: CharOffice) => {
                                                        return `${office.officeTitleDescription} for ${office.affiliatedGroupName}`;
                                                    })
                                                    .join('; ')
                                            }</td>
                                        }
                                    </tr>
                                    <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                </tbody>
                            </table>
                            <p>
                                <div sq-flex class={this.findUpdate('reputation') ? 'textRow textRow-highlight' : 'textRow'}><span sq-mr-auto>Reputation</span> {this.hero.reputation}</div>
                                <div class="textRow">Social Exposure</div>
                                <sq-progress-bar
                                    totalValue={this.hero.maxSocialCapital}
                                    currentValue={this.hero.socialExposure}
                                    tapOverlayText={`${Math.floor(100 * this.hero.socialExposure / this.hero.maxSocialCapital)}%`}
                                ></sq-progress-bar>
                                <div class="textRow">Questlog</div>
                                <sq-progress-bar
                                    totalValue={this.hero.maxQuestLogSize}
                                    currentValue={this.hero.leads.length}
                                    tapOverlayText={`${this.hero.leads.length}/${this.hero.maxQuestLogSize}`}
                                ></sq-progress-bar>
                            </p>
                            <table class="listBox">
                                <thead>
                                    <tr>
                                        <th>Quests</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.hero.leads.length == 0
                                        ? <tr><td>[None]</td></tr>
                                        : this.hero.leads.map((item, index, array) => 
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
                                <sq-progress-bar
                                    totalValue={getXpRequiredForNextLevel(this.hero.level)}
                                    currentValue={this.hero.currentXp}
                                    tapOverlayText={`${getXpRequiredForNextLevel(this.hero.level) - this.hero.currentXp} xp needed`}
                                ></sq-progress-bar>
                            </p>
                            <p>
                                <div class={this.findUpdate('currentAdventure') ? 'textRow textRow-highlight' : 'textRow'}>{this.hero.currentAdventure.name}</div>
                                <sq-progress-bar 
                                    totalValue={this.hero.currentAdventure.progressRequired}
                                    currentValue={this.hero.adventureProgress}
                                    tapOverlayText={`${getRoughTime(this.hero.currentAdventure.progressRequired - this.hero.adventureProgress)} remaining`}
                                ></sq-progress-bar>
                                <table class="listBox">
                                    <thead>
                                        <tr>
                                            <th>Completed Adventures</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.hero.completedAdventures.length === 0
                                            ? <tr><td>[None]</td></tr>
                                            : this.hero.completedAdventures.map((adventure: string, index, array) => 
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
                        this.hero.marketSaturation >= this.hero.maxMarketSaturation
                        ? <div class="textRow"><b>MARKET SATURATED</b></div>
                        : this.hero.fatigue >= this.hero.maxFatigue
                            ? <div class="textRow"><b>FATIGUED</b></div>
                            : this.hero.socialExposure >= this.hero.maxSocialCapital
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
                                <sq-progress-bar
                                    totalValue={this.activeTask.durationMs}
                                    currentValue={this.activeTaskProgressMs}
                                    tapOverlayText={`${Math.floor(100 * this.activeTaskProgressMs / this.activeTask.durationMs)}%`}
                                ></sq-progress-bar>]
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
    hero = "Hero",
    inventory = "Inventory",
    deeds = "Deeds",
    social = "Social",
    actions = "Actions",
    plot = "Plot",
}
