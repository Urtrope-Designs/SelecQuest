import { Component, Prop, State, Event, EventEmitter, Element, Watch } from '@stencil/core';

import { AppState, Task, AccoladeType, Hero, QuestMajorReward, HeroStat } from '../../models/models';
import { HeroManager } from '../../services/hero-manager';
import { capitalizeInitial, getRoughTime, generateHeroHashFromHero, toRoman } from '../../global/utils';
import { HeroAbilityType, HeroAbility } from '../../models/hero-models';
import { GameSetting } from '../../global/game-setting';
import { TaskMode } from '../../models/task-models';

@Component({
    tag: 'sq-play-screen',
    styleUrl: 'play-screen.scss'
})
export class PlayScreen {
    @Prop() appState: AppState;
    @Prop() gameSetting: GameSetting;
    @Prop() availableHeroes: {hash: string, name: string}[];

    @Element() homeEl: HTMLElement;
    private activeTaskProgressInterval: number;
    @State() activeTaskProgressMs: number = 0;
    @State() activeVisibleSection: VisibleSection;
    @State() selectedAvailableHeroHash: string = '';
    @State() heroHashWeAreWaitingFor: string = '';
    @Event() taskModeAction: EventEmitter<TaskMode>;
    @Event() clearAllGameData: EventEmitter;
    @Event() buildNewHero: EventEmitter;
    @Event() playNewHero: EventEmitter<string>;
    @Event() deleteHero: EventEmitter<string>;

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

    taskModeButtonClicked(newTaskModeIndex: number) {
        this.taskModeAction.emit(TaskMode[TaskMode[newTaskModeIndex]]);
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
        if (hero.lootEnvironmentalLimit >= hero.maxLootEnvironmentalLimit || hero.trialEnvironmentalLimit >= hero.maxTrialEnvironmentalLimit || hero.questEnvironmentalLimit >= hero.maxQuestEnvironmentalLimit) {
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
                                totalValue={HeroManager.getXpRequiredForNextLevel(this.appState.hero.level)}
                                currentValue={this.appState.hero.currentXp}
                                tapOverlayText={`${HeroManager.getXpRequiredForNextLevel(this.appState.hero.level) - this.appState.hero.currentXp} xp needed`}
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
                                        {
                                            this.appState.hero.stats.map((stat: HeroStat) =>
                                                <tr {...(this.highlightModifiedAttribute('stats', stat.name))}>
                                                    <td>{capitalizeInitial(stat.name)}</td>
                                                    <td>{stat.value}</td>
                                                </tr>
                                            )
                                        }
                                        <tr {...this.highlightModifiedAttribute('maxHealthStat')}>
                                            <td>Max {this.appState.hero.maxHealthStat.name}</td>
                                            <td>{this.appState.hero.maxHealthStat.value}</td>
                                        </tr>
                                        <tr {...this.highlightModifiedAttribute('maxMagicStat')}>
                                            <td>Max {this.appState.hero.maxMagicStat.name}</td>
                                            <td>{this.appState.hero.maxMagicStat.value}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                {
                                    this.appState.hero.abilities.map((abilityType: HeroAbilityType) =>
                                        <table class="listBox">
                                            <thead>
                                                <tr>
                                                    <th style={{width: "65%"}}>{capitalizeInitial(abilityType.name)}</th>
                                                    <th>Rank</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    abilityType.received.length == 0
                                                    ? <tr><td colSpan={2}>[None]</td></tr>
                                                    : abilityType.received.map((ability: HeroAbility) =>
                                                        <tr {...(this.highlightOrNot(this.findUpdate('abilities', ((data: HeroAbilityType) => data.name == abilityType.name && data.received.some(a => a.name == ability.name)))))}>
                                                            <td>{ability.name}</td>
                                                            <td>{toRoman(ability.rank)}</td>
                                                        </tr>
                                                    )
                                                }
                                                <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                            </tbody>
                                        </table>
                                    )
                                }
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
                                    <div sq-flex class={this.findUpdate('currency', ((data: TaskMode[]) => data.includes(TaskMode.LOOT_MODE))) ? 'textRow textRow-highlight' : 'textRow'}>
                                        <span sq-mr-auto>Gold</span> {this.appState.hero.currency[TaskMode.LOOT_MODE] - this.appState.hero.spentCurrency[TaskMode.LOOT_MODE]}
                                    </div>
                                    <div class="textRow">Encumbrance</div>
                                    <div class="indentRow">
                                        <sq-progress-bar
                                            totalValue={this.appState.hero.maxLootBuildUp}
                                            currentValue={this.appState.hero.lootBuildUpRewards.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}
                                            tapOverlayText={`${this.appState.hero.lootBuildUpRewards.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}/${this.appState.hero.maxLootBuildUp}`}
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
                                            this.appState.hero.lootBuildUpRewards.length == 0
                                            ? <tr><td colSpan={2}>[None]</td></tr>
                                            : this.appState.hero.lootBuildUpRewards.map((item) => 
                                            <tr {...this.highlightModifiedAttribute('lootBuildUpRewards', item.name)}>
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
                                    <div sq-flex class={this.findUpdate('currency', ((data: TaskMode[]) => data.includes(TaskMode.TRIAL_MODE))) ? 'textRow textRow-highlight' : 'textRow'}>
                                        <span sq-mr-auto>Renown</span> {this.appState.hero.currency[TaskMode.TRIAL_MODE]}
                                    </div>
                                    <div class="textRow">Equipment Wear</div>
                                    <div class="indentRow">
                                        <sq-progress-bar
                                            totalValue={this.appState.hero.maxTrialBuildUp}
                                            currentValue={this.appState.hero.trialBuildUpRewards.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}
                                            tapOverlayText={`${this.appState.hero.trialBuildUpRewards.reduce((prevVal, curItem) => {return prevVal + curItem.quantity}, 0)}/${this.appState.hero.maxTrialBuildUp}`}
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
                                            this.appState.hero.trialBuildUpRewards.length == 0
                                            ? <tr><td colSpan={2}>[None]</td></tr>
                                            : this.appState.hero.trialBuildUpRewards.map((item) => 
                                            <tr {...this.highlightModifiedAttribute('trialBuildUpRewards', item.name)}>
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
                                                .map((affiliation: QuestMajorReward) => 
                                                    <tr {...this.findUpdate('affiliations', (data: QuestMajorReward) => data.connection != null && data.groupName == affiliation.groupName) ? {class: 'textRow-highlight'} : {}}>
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
                                                .map((affiliation: QuestMajorReward) => 
                                                    <tr {...this.findUpdate('affiliations', (data: QuestMajorReward) => data.office != null && data.groupName == affiliation.groupName) ? {class: 'textRow-highlight'} : {}}>
                                                        <td>{capitalizeInitial(affiliation.groupName)}</td>
                                                        <td>{affiliation.office}</td>
                                                    </tr>
                                                )
                                        }
                                        <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                    </tbody>
                                </table>
                                <p>
                                    <div sq-flex class={this.findUpdate('currency', ((data: TaskMode[]) => data.includes(TaskMode.TRIAL_MODE))) ? 'textRow textRow-highlight' : 'textRow'}>
                                        <span sq-mr-auto>Reputation</span> {this.appState.hero.currency[TaskMode.QUEST_MODE]}
                                    </div>
                                    <div class="textRow">Questlog</div>
                                    <div class="indentRow">
                                        <sq-progress-bar
                                            totalValue={this.appState.hero.maxQuestBuildUp}
                                            currentValue={this.appState.hero.questBuildUpRewards.length}
                                            tapOverlayText={`${this.appState.hero.questBuildUpRewards.length}/${this.appState.hero.maxQuestBuildUp}`}
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
                                            this.appState.hero.questBuildUpRewards.length == 0
                                            ? <tr><td>[None]</td></tr>
                                            : this.appState.hero.questBuildUpRewards.map((item, index, array) => 
                                                    <tr {...this.findUpdate('questBuildUpRewards') && index == array.length-1 ? {class: 'textRow-highlight'} : {}}>
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
                            {
                                this.gameSetting.taskModeData.map((modeData, index: number) => 
                                    <button 
                                        {...(this.appState.activeTaskMode != index ? {} : {class: 'selected'})}
                                        onClick={ () => this.taskModeButtonClicked(index)}
                                    >
                                        {modeData.taskModeActionName}
                                    </button>
                                )
                            }
                        </div>
                        {
                            this.appState.activeTaskMode == TaskMode.LOOT_MODE
                                ? [
                                    <div class="textRow">
                                    {
                                        this.appState.hero.lootEnvironmentalLimit >= this.appState.hero.maxLootEnvironmentalLimit 
                                        ? <b style={{display: 'block', textAlign: 'center'}}>&#9733; MARKET SATURATED &#9733;</b>
                                        : <span>Market Saturation</span>
                                    }
                                    </div>,
                                    <div class="indentRow">
                                        <sq-progress-bar
                                            totalValue={this.appState.hero.maxLootEnvironmentalLimit}
                                            currentValue={this.appState.hero.lootEnvironmentalLimit}
                                            tapOverlayText={`${Math.floor(100 * this.appState.hero.lootEnvironmentalLimit / this.appState.hero.maxLootEnvironmentalLimit)}%`}
                                        ></sq-progress-bar>
                                    </div>
                                ]
                            : this.appState.activeTaskMode == TaskMode.TRIAL_MODE
                                ? [
                                    <div class="textRow">
                                    {
                                        this.appState.hero.trialEnvironmentalLimit >= this.appState.hero.maxTrialEnvironmentalLimit
                                        ? <b style={{display: 'block', textAlign: 'center'}}>&#9733; FATIGUED &#9733;</b>
                                        : <span>Fatigue</span>
                                    }
                                    </div>,
                                    <div class="indentRow">
                                        <sq-progress-bar
                                            totalValue={this.appState.hero.maxTrialEnvironmentalLimit}
                                            currentValue={this.appState.hero.trialEnvironmentalLimit}
                                            tapOverlayText={`${Math.floor(100 * this.appState.hero.trialEnvironmentalLimit / this.appState.hero.maxTrialEnvironmentalLimit)}%`}
                                        ></sq-progress-bar>
                                    </div>
                                ]
                            : [
                                <div class="textRow">
                                {
                                    this.appState.hero.questEnvironmentalLimit >= this.appState.hero.maxQuestEnvironmentalLimit
                                    ? <b style={{display: 'block', textAlign: 'center'}}>&#9733; OVEREXPOSED &#9733;</b>
                                    : <span>Social Exposure</span>

                                }
                                </div>,
                                <div class="indentRow">
                                    <sq-progress-bar
                                        totalValue={this.appState.hero.maxQuestEnvironmentalLimit}
                                        currentValue={this.appState.hero.questEnvironmentalLimit}
                                        tapOverlayText={`${Math.floor(100 * this.appState.hero.questEnvironmentalLimit / this.appState.hero.maxQuestEnvironmentalLimit)}%`}
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
