import { Component, Prop, State, Event, EventEmitter, Element, Watch } from '@stencil/core';

import { AppState, Task, TaskMode, AccoladeType, Hero, CharAffiliation } from '../../models/models';
import { getXpRequiredForNextLevel } from '../../helpers/hero-manager';
import { capitalizeInitial, getRoughTime, generateHeroHashFromHero } from '../../helpers/utils';

@Component({
    tag: 'sq-play-screen',
    styleUrl: 'play-screen.scss'
})
export class PlayScreen {
    @Prop() appState: AppState;
    @Prop() availableHeroes: {hash: string, name: string}[];

    @Element() homeEl: HTMLElement;
    private activeTaskProgressInterval: number;
    @State() activeTaskProgressMs: number = 0;
    @State() activeVisibleSection: VisibleSection;
    @State() selectedAvailableHeroHash: string = '';
    @State() heroHashWeAreWaitingFor: string = '';
    @Event() taskModeAction: EventEmitter;
    @Event() clearAllGameData: EventEmitter;
    @Event() buildNewHero: EventEmitter;
    @Event() playNewHero: EventEmitter;
    @Event() deleteHero: EventEmitter;

    @Watch('appState')
    stateHandler(newState: AppState) {
        if (newState.hasActiveTask) {
            this._updateTaskTimer();
        }
        if (!!newState.hero && generateHeroHashFromHero(newState.hero) == this.heroHashWeAreWaitingFor) {
            this.heroHashWeAreWaitingFor = '';
            this.selectedAvailableHeroHash = '';
            this.activeVisibleSection = VisibleSection.hero;
        }
    }

    _updateTaskTimer() {
        clearInterval(this.activeTaskProgressInterval);
        this.activeTaskProgressMs = new Date().getTime() - this.appState.activeTask.taskStartTime;
        this.activeTaskProgressInterval = window.setInterval((activeTask: Task) => {
            this.activeTaskProgressMs = new Date().getTime() - activeTask.taskStartTime;
        }, 100, this.appState.activeTask);
    }

    componentWillLoad() {
        this.activeVisibleSection = VisibleSection.hero;
        if (!!this.appState && this.appState.hasActiveTask) {
            this._updateTaskTimer();
        }
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
        const contentElem: HTMLIonContentElement = this.homeEl.querySelector('ion-content');
        contentElem.scrollToTop(0);
    }

    setSelectedAvailableHeroHash(newHash: string) {
        if (this.selectedAvailableHeroHash == newHash) {
            this.selectedAvailableHeroHash = '';
        } else {
            this.selectedAvailableHeroHash = newHash;
        }
    }

    newHeroButtonClicked() {
        this.buildNewHero.emit();
    }

    playHeroButtonClicked() {
        this.heroHashWeAreWaitingFor = this.selectedAvailableHeroHash;
        this.playNewHero.emit(this.selectedAvailableHeroHash);
    }

    deleteHeroButtonClicked() {
        this.deleteHero.emit(this.selectedAvailableHeroHash);
    }

    clearDataButtonClicked() {
        this.clearAllGameData.emit();
    }

    findUpdate(attributeName: string, dataMatch?: (any) => boolean) {
        const found = this.appState.hero.latestModifications
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

    static _getAdventureTimeRemainingString(hero: Hero): string {
        let timeRemaining = hero.currentAdventure.progressRequired - hero.adventureProgress;
        if (hero.marketSaturation >= hero.maxMarketSaturation || hero.fatigue >= hero.maxFatigue || hero.socialExposure >= hero.maxSocialCapital) {
            timeRemaining *= 2;
        }
        return `${getRoughTime(timeRemaining)} remaining`
    }

    _textRowScrollHandler(ev: Event) {
        ev.srcElement.setAttribute('scrolled', ev.srcElement.scrollLeft != 0 ? 'true' : 'false');
    }

    render() {
        if (this.appState != null) {
            return (
                <ion-page class='ion-page show-page'>
                    <ion-header>
                        <div class="headlineRow">
                            <hr/>
                            <h1>SelecQuest</h1>
                            <hr/>
                        </div>
                        <div
                            class="textRow textRow-scroll"
                            onScroll={(e) => this._textRowScrollHandler(e)}
                        >
                            {this.appState.hero.name}, the {this.appState.hero.raceName} {this.appState.hero.class}
                        </div>
                        <div sq-flex style={{alignItems: 'baseline'}} class="textRow">
                            <div style={{flexShrink: '0'}}>Lvl {this.appState.hero.level}&nbsp;</div>
                            <sq-progress-bar
                                totalValue={getXpRequiredForNextLevel(this.appState.hero.level)}
                                currentValue={this.appState.hero.currentXp}
                                tapOverlayText={`${getXpRequiredForNextLevel(this.appState.hero.level) - this.appState.hero.currentXp} xp needed`}
                            ></sq-progress-bar>
                        </div>
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
                        <hr/>
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
                                        <tr><td>Name</td><td>{this.appState.hero.name}</td></tr>
                                        <tr><td>Race</td><td>{this.appState.hero.raceName}</td></tr>
                                        <tr><td>Class</td><td>{this.appState.hero.class}</td></tr>
                                        <tr {...this.highlightModifiedAttribute('level')}><td>Level</td><td>{this.appState.hero.level}</td></tr>
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
                                        <tr {...this.highlightModifiedAttribute('str')}><td>Str</td><td>{this.appState.hero.str}</td></tr>
                                        <tr {...this.highlightModifiedAttribute('dex')}><td>Dex</td><td>{this.appState.hero.dex}</td></tr>
                                        <tr {...this.highlightModifiedAttribute('con')}><td>Con</td><td>{this.appState.hero.con}</td></tr>
                                        <tr {...this.highlightModifiedAttribute('wis')}><td>Wis</td><td>{this.appState.hero.wis}</td></tr>
                                        <tr {...this.highlightModifiedAttribute('int')}><td>Int</td><td>{this.appState.hero.int}</td></tr>
                                        <tr {...this.highlightModifiedAttribute('cha')}><td>Cha</td><td>{this.appState.hero.cha}</td></tr>
                                        <tr {...this.highlightModifiedAttribute('maxHp')}><td>Max HP</td><td>{this.appState.hero.maxHp}</td></tr>
                                        <tr {...this.highlightModifiedAttribute('maxMp')}><td>Max MP</td><td>{this.appState.hero.maxMp}</td></tr>
                                    </tbody>
                                </table>
                                <table class="listBox">
                                    <thead>
                                        <tr>
                                            <th style={{width: "65%"}}>Spells</th>
                                            <th>Rank</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.appState.hero.spells.length == 0 
                                            ? <tr><td colSpan={2}>[None]</td></tr>    
                                            : this.appState.hero.spells.map((spell) => 
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
                                            this.appState.hero.abilities.length == 0 
                                            ? <tr><td colSpan={2}>[None]</td></tr>    
                                            : this.appState.hero.abilities.map((ability) => 
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
                            : this.activeVisibleSection == VisibleSection.gear
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
                                            this.appState.hero.equipment.map(equip => 
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
                                    <div sq-flex class={this.findUpdate('gold') ? 'textRow textRow-highlight' : 'textRow'}><span sq-mr-auto>Gold</span> {this.appState.hero.gold}</div>
                                    <div class="textRow">Encumbrance</div>
                                    <div class="indentRow">
                                        <sq-progress-bar
                                            totalValue={this.appState.hero.maxEncumbrance}
                                            currentValue={this.appState.hero.loot.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}
                                            tapOverlayText={`${this.appState.hero.loot.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}/${this.appState.hero.maxEncumbrance}`}
                                        ></sq-progress-bar>
                                    </div>
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
                                            this.appState.hero.loot.length == 0
                                            ? <tr><td colSpan={2}>[None]</td></tr>
                                            : this.appState.hero.loot.map((item) => 
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
                                            this.appState.hero.accolades.map(accolade =>
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
                                    <div sq-flex class={this.findUpdate('renown') ? 'textRow textRow-highlight' : 'textRow'}><span sq-mr-auto>Renown</span> {this.appState.hero.renown}</div>
                                    <div sq-flex class={this.findUpdate('spentRenown') ? 'textRow textRow-highlight' : 'textRow'}><span sq-mr-auto>Spent Renown</span> {this.appState.hero.spentRenown}</div>
                                    <div class="textRow">Equipment Wear</div>
                                    <div class="indentRow">
                                        <sq-progress-bar
                                            totalValue={this.appState.hero.maxEquipmentWear}
                                            currentValue={this.appState.hero.trophies.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}
                                            tapOverlayText={`${this.appState.hero.trophies.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}/${this.appState.hero.maxEquipmentWear}`}
                                        ></sq-progress-bar>
                                    </div>
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
                                            this.appState.hero.trophies.length == 0
                                            ? <tr><td colSpan={2}>[None]</td></tr>
                                            : this.appState.hero.trophies.map((item) => 
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
                            : this.activeVisibleSection == VisibleSection.story
                            ? <section>                    
                                <table class="listBox">
                                    <thead>
                                        <tr>
                                            <th style={{width: "50%"}}>Connections</th>
                                            <th>Group</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.appState.hero.affiliations.length <= 0
                                            ? <tr><td colSpan={2}>[None]</td></tr>
                                            : this.appState.hero.affiliations
                                                .map((affiliation: CharAffiliation) => 
                                                    <tr {...this.findUpdate('affiliations', (data: CharAffiliation) => data.connection != null && data.groupName == affiliation.groupName) ? {class: 'textRow-highlight'} : {}}>
                                                        <td>{affiliation.connection.personName}, the {affiliation.connection.personTitle}</td>
                                                        <td>{capitalizeInitial(affiliation.groupName)}</td>
                                                    </tr>
                                                )
                                        }
                                        <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                    </tbody>
                                </table>
                                <table class="listBox">
                                    <thead>
                                        <tr>
                                            <th style={{width: "50%"}}>Memberships</th>
                                            <th>Office</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.appState.hero.affiliations.filter(a => a.office != null).length <= 0
                                            ? <tr><td colSpan={2}>[None]</td></tr>
                                            : this.appState.hero.affiliations.filter(a => a.office != null)
                                                .map((affiliation: CharAffiliation) => 
                                                    <tr {...this.findUpdate('affiliations', (data: CharAffiliation) => data.office != null && data.groupName == affiliation.groupName) ? {class: 'textRow-highlight'} : {}}>
                                                        <td>{capitalizeInitial(affiliation.groupName)}</td>
                                                        <td>{affiliation.office}</td>
                                                    </tr>
                                                )
                                        }
                                        <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                    </tbody>
                                </table>
                                <p>
                                    <div sq-flex class={this.findUpdate('reputation') ? 'textRow textRow-highlight' : 'textRow'}><span sq-mr-auto>Reputation</span> {this.appState.hero.reputation}</div>
                                    <div sq-flex class={this.findUpdate('spentReputation') ? 'textRow textRow-highlight' : 'textRow'}><span sq-mr-auto>Leveraged Reputation</span> {this.appState.hero.spentReputation}</div>
                                    <div class="textRow">Questlog</div>
                                    <div class="indentRow">
                                        <sq-progress-bar
                                            totalValue={this.appState.hero.maxQuestLogSize}
                                            currentValue={this.appState.hero.leads.length}
                                            tapOverlayText={`${this.appState.hero.leads.length}/${this.appState.hero.maxQuestLogSize}`}
                                        ></sq-progress-bar>
                                    </div>
                                </p>
                                <table class="listBox">
                                    <thead>
                                        <tr>
                                            <th>Quests</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.appState.hero.leads.length == 0
                                            ? <tr><td>[None]</td></tr>
                                            : this.appState.hero.leads.map((item, index, array) => 
                                                    <tr {...this.findUpdate('leads') && index == array.length-1 ? {class: 'textRow-highlight'} : {}}>
                                                        <td>{item.questlogName}</td>
                                                    </tr>
                                                )
                                        }
                                        <tr><td class="placeholderRow"></td></tr>
                                    </tbody>
                                </table>
                                <p>
                                    <div class={this.findUpdate('currentAdventure') ? 'textRow textRow-highlight' : 'textRow'}>{this.appState.hero.currentAdventure.name}</div>
                                    <div class="indentRow">
                                        <sq-progress-bar 
                                            totalValue={this.appState.hero.currentAdventure.progressRequired}
                                            currentValue={this.appState.hero.adventureProgress}
                                            tapOverlayText={PlayScreen._getAdventureTimeRemainingString(this.appState.hero)}
                                        ></sq-progress-bar>
                                    </div>
                                </p>
                                <table class="listBox">
                                    <thead>
                                        <tr>
                                            <th>Completed Adventures</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.appState.hero.completedAdventures.length === 0
                                            ? <tr><td>[None]</td></tr>
                                            : this.appState.hero.completedAdventures.map((adventure: string, index, array) => 
                                                <tr {...this.findUpdate('completedAdventures') && index == array.length-1 ? {class: 'textRow-highlight'} : {}}><td>{adventure}</td></tr>
                                            )
                                        }
                                        <tr><td class="placeholderRow"></td></tr>
                                    </tbody>
                                </table>
                            </section>
                            : <section>
                                <p>
                                    <button class="selected" onClick={() => this.newHeroButtonClicked()}>New Hero</button>
                                </p>
                                <table class="listBox">
                                    <thead>
                                        <tr>
                                            <th>Available Heroes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            !this.availableHeroes
                                            ? <tr><td>Loading...</td></tr>
                                            : this.availableHeroes.map((hero) => 
                                                <tr {...this.selectedAvailableHeroHash == hero.hash ? {class: 'textRow-highlight'} : {}} onClick={() => this.setSelectedAvailableHeroHash(hero.hash)}><td>{hero.name}</td></tr>
                                            )
                                        }
                                        <tr><td class="placeholderRow"></td></tr>
                                    </tbody>
                                </table>
                                <div class="buttonRow">
                                    <button 
                                        disabled={!this.selectedAvailableHeroHash || this.selectedAvailableHeroHash == generateHeroHashFromHero(this.appState.hero) || !!this.heroHashWeAreWaitingFor}
                                        class="selected"
                                        onClick={() => this.playHeroButtonClicked()}
                                    >Play</button>
                                    <button
                                        disabled={!this.selectedAvailableHeroHash || !!this.heroHashWeAreWaitingFor}
                                        class="selected"
                                        onClick={() => this.deleteHeroButtonClicked()}
                                    >Delete</button>
                                </div>
                                <div style={{textAlign: 'right'}}>
                                    <button class="selected" onClick={() => this.clearDataButtonClicked()}>Clear All Data</button>
                                </div>
                            </section>
                        }
                    </ion-content>
                    <ion-footer>
                        <hr />
                        <div class="buttonRow">
                            <button {...(this.appState.activeTaskMode != TaskMode.LOOTING ? {} : {class: 'selected'})} onClick={ () => this.taskModeButtonClicked(TaskMode.LOOTING)}>Loot</button>
                            <button {...(this.appState.activeTaskMode == TaskMode.GLADIATING ? {class: 'selected'} : {})} onClick={ () => this.taskModeButtonClicked(TaskMode.GLADIATING)}>Gladiate</button>
                            <button {...(this.appState.activeTaskMode == TaskMode.INVESTIGATING ? {class: 'selected'} : {})} onClick={ () => this.taskModeButtonClicked(TaskMode.INVESTIGATING)}>Investigate</button>
                        </div>
                        {
                            this.appState.activeTaskMode == TaskMode.LOOTING
                                ? [
                                    <div class="textRow">
                                    {
                                        this.appState.hero.marketSaturation >= this.appState.hero.maxMarketSaturation 
                                        ? <b style={{display: 'block', textAlign: 'center'}}>&#9733; MARKET SATURATED &#9733;</b>
                                        : <span>Market Saturation</span>
                                    }
                                    </div>,
                                    <div class="indentRow">
                                        <sq-progress-bar
                                            totalValue={this.appState.hero.maxMarketSaturation}
                                            currentValue={this.appState.hero.marketSaturation}
                                            tapOverlayText={`${Math.floor(100 * this.appState.hero.marketSaturation / this.appState.hero.maxMarketSaturation)}%`}
                                        ></sq-progress-bar>
                                    </div>
                                ]
                            : this.appState.activeTaskMode == TaskMode.GLADIATING
                                ? [
                                    <div class="textRow">
                                    {
                                        this.appState.hero.fatigue >= this.appState.hero.maxFatigue
                                        ? <b style={{display: 'block', textAlign: 'center'}}>&#9733; FATIGUED &#9733;</b>
                                        : <span>Fatigue</span>
                                    }
                                    </div>,
                                    <div class="indentRow">
                                        <sq-progress-bar
                                            totalValue={this.appState.hero.maxFatigue}
                                            currentValue={this.appState.hero.fatigue}
                                            tapOverlayText={`${Math.floor(100 * this.appState.hero.fatigue / this.appState.hero.maxFatigue)}%`}
                                        ></sq-progress-bar>
                                    </div>
                                ]
                            : [
                                <div class="textRow">
                                {
                                    this.appState.hero.socialExposure >= this.appState.hero.maxSocialCapital
                                    ? <b style={{display: 'block', textAlign: 'center'}}>&#9733; OVEREXPOSED &#9733;</b>
                                    : <span>Social Exposure</span>

                                }
                                </div>,
                                <div class="indentRow">
                                    <sq-progress-bar
                                        totalValue={this.appState.hero.maxSocialCapital}
                                        currentValue={this.appState.hero.socialExposure}
                                        tapOverlayText={`${Math.floor(100 * this.appState.hero.socialExposure / this.appState.hero.maxSocialCapital)}%`}
                                    ></sq-progress-bar>
                                </div>
                            ]
                        }
                        {
                            !!this.appState.activeTask
                            ? [
                                <div 
                                    class="textRow textRow-scroll"
                                    onScroll={(e) => this._textRowScrollHandler(e)}
                                >{this.appState.activeTask.description}&hellip;</div>,
                                <div class="indentRow">
                                    <sq-progress-bar
                                        totalValue={this.appState.activeTask.durationMs}
                                        currentValue={this.activeTaskProgressMs}
                                        tapOverlayText={`${Math.floor(100 * this.activeTaskProgressMs / this.appState.activeTask.durationMs)}%`}
                                    ></sq-progress-bar>
                                </div>
                            ]
                            : [<div class="textRow">Loading&hellip;</div>,
                            <div class="indentRow"><sq-progress-bar totalValue={1} currentValue={0}></sq-progress-bar></div>]
                        }
                    </ion-footer>
                </ion-page>
            );
        }
    }
}

enum VisibleSection {
    hero = "Hero",
    gear = "Gear",
    deeds = "Deeds",
    story = "Story",
    game = "Game",
}
