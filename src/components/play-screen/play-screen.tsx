import { Component, Prop, State, Event, EventEmitter, Element, Watch } from '@stencil/core';
import OverlayScrollbars from 'overlayscrollbars';

import { AppState, Task, Hero, QuestMajorReward, HeroStat } from '../../models/models';
import { HeroManager } from '../../services/hero-manager';
import { capitalizeInitial, getRoughTime, generateHeroHashFromHero, toRoman, toOrdinal, toMultiplier } from '../../global/utils';
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
    @State() activeGameViewTab: string;
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
            this.activeGameViewTab = this.gameSetting.gameViewTabDisplayNames[GameViewTab.HERO];
        }
    }

    _updateTaskTimer() {
        clearInterval(this.activeTaskProgressInterval);
        this.activeTaskProgressMs = new Date().getTime() - this.appState.currentTask.taskStartTime;
        this.activeTaskProgressInterval = window.setInterval((activeTask: Task) => {
            this.activeTaskProgressMs = new Date().getTime() - activeTask.taskStartTime;
        }, 100, this.appState.currentTask);
    }

    componentWillLoad() {
        this.activeGameViewTab = this.gameSetting.gameViewTabDisplayNames[GameViewTab.HERO];
        if (!!this.appState && this.appState.hasActiveTask) {
            this._updateTaskTimer();
        }
    }

    componentDidLoad() {
        const scrollableElements = document.querySelectorAll('[sq-scrollable]');
        OverlayScrollbars(scrollableElements, {});
    }

    taskModeButtonClicked(newTaskModeIndex: number) {
        this.taskModeAction.emit(TaskMode[TaskMode[newTaskModeIndex]]);
    }

    gameViewTabClicked(selectedGameViewTab: string) {
        this.activeGameViewTab = selectedGameViewTab;
        const contentElem = this.homeEl.querySelector('.coreContent');
        contentElem.scrollTop = 0;
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

    getCurrencyDisplayValue(hero: Hero, taskMode: TaskMode): number {
        const currencyDisplay = this.gameSetting.taskModeData[taskMode].isCurrencyCumulative 
                ? hero.currency[taskMode]
                : hero.currency[taskMode] - this.appState.hero.spentCurrency[taskMode];

        return Math.floor(currencyDisplay);
    }

    getDisplayNameWithMultiplier(baseDisplayName: string, multiplier: number): string {
        baseDisplayName = multiplier > 1 ? `${toMultiplier(multiplier)} ${baseDisplayName}` :  baseDisplayName;
        return capitalizeInitial(baseDisplayName); 
    }

    _textRowScrollHandler(ev: Event) {
        (ev.target as Element).setAttribute('scrolled', (ev.target as Element).scrollLeft != 0 ? 'true' : 'false');
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
                            sq-scrollable
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
                                this.gameSetting.gameViewTabDisplayNames.map(tabName => 
                                    <button 
                                    {...(this.activeGameViewTab == tabName ? {class: 'selected'} : {})}
                                    onClick={ () => this.gameViewTabClicked(tabName)}
                                    >
                                        {tabName}
                                    </button>
                                )
                            }
                        </div>
                        <hr/>
                    </ion-header>
                    <div class="coreContent">
                        <div style={{height: "100%", paddingRight: "17px"}} sq-scrollable>
                            {
                                this.activeGameViewTab == this.gameSetting.gameViewTabDisplayNames[GameViewTab.HERO]
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
                                : this.activeGameViewTab == this.gameSetting.gameViewTabDisplayNames[GameViewTab.GEAR]
                                ? <section>
                                    <table class="listBox">
                                        <thead>
                                            <tr>
                                                <th style={{width:"43%"}}>{this.gameSetting.taskModeData[0].majorRewardDisplayName[0]}</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.appState.hero.lootMajorRewards.map(equip => 
                                                    <tr {...this.highlightModifiedAttribute('lootMajorRewards', equip.type)}>
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
                                            <span sq-mr-auto>{this.gameSetting.taskModeData[0].currencyDisplayName}</span> {this.getCurrencyDisplayValue(this.appState.hero, TaskMode.LOOT_MODE)}
                                        </div>
                                        <div class="textRow">{this.gameSetting.taskModeData[0].buildUpLimitDisplayName}</div>
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
                                                <th style={{width: "65%"}}>{this.gameSetting.taskModeData[0].buildUpRewardDisplayName}</th>
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
                                : this.activeGameViewTab == this.gameSetting.gameViewTabDisplayNames[GameViewTab.DEEDS]
                                ? <section>
                                    <p>
                                        <div sq-flex class="textRow">
                                            <span sq-mr-auto>Competitive Class</span> {this.getDisplayNameWithMultiplier(this.appState.hero.trialCurrentCompetitiveClass.competitiveClassName, this.appState.hero.trialCurrentCompetitiveClass.competitiveClassMultiplier)}
                                        </div>
                                    </p>
                                    <table class="listBox">
                                        <thead>
                                            <tr>
                                                <th style={{width: "65%"}}>System</th>
                                                <th>Ranking</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.appState.hero.trialRankings.map(trialRanking =>
                                                    <tr {...this.highlightModifiedAttribute('trialRankings', trialRanking.rankingSystemName)}>
                                                        <td>{trialRanking.rankingSystemName}</td>
                                                        <td>{trialRanking.currentRanking}</td>
                                                    </tr>
                                                )
                                            }
                                            <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                        </tbody>
                                    </table>
                                    <table class="listBox">
                                        <thead>
                                            <tr>
                                                <th style={{width: "40%"}}>Class</th>
                                                <th>Titles</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.appState.hero.trialTitles.map(trialTitles =>
                                                    <tr {...this.highlightModifiedAttribute('trialTitles', trialTitles.competitiveClassName)}>
                                                        <td>{trialTitles.competitiveClassName}</td>
                                                        {
                                                            trialTitles.titles.length <= 0
                                                            ? <td>[None]</td>
                                                            : <td>{trialTitles.titles.map(t => this.getDisplayNameWithMultiplier(t.titleName, t.titleTimesEarned)).join('\n')}</td>
                                                        }
                                                    </tr>
                                                )
                                            }
                                            <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                        </tbody>
                                    </table>
                                    <table class="listBox">
                                        <thead>
                                            <tr>
                                                <th style={{width: "45%"}}>{this.gameSetting.taskModeData[1].majorRewardDisplayName[0]}</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.appState.hero.trialMajorRewards.map(trialMajorReward =>
                                                    <tr {...this.highlightModifiedAttribute('trialMajorRewards', ''+trialMajorReward.type)}>
                                                        <td>{trialMajorReward.type}</td>
                                                        {
                                                            trialMajorReward.received.length <= 0
                                                            ? <td>[None]</td>
                                                            : <td>{trialMajorReward.received.join(', ')}</td>
                                                        }
                                                    </tr>
                                                )
                                            }
                                            <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                        </tbody>
                                    </table>
                                    <p>
                                        <div sq-flex class={this.findUpdate('currency', ((data: TaskMode[]) => data.includes(TaskMode.TRIAL_MODE))) ? 'textRow textRow-highlight' : 'textRow'}>
                                            <span sq-mr-auto>{this.gameSetting.taskModeData[1].currencyDisplayName}</span> {this.getCurrencyDisplayValue(this.appState.hero, TaskMode.TRIAL_MODE)}
                                        </div>
                                        <div class="textRow">{this.gameSetting.taskModeData[1].buildUpLimitDisplayName}</div>
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
                                                <th style={{width: "65%"}}>{this.gameSetting.taskModeData[1].buildUpRewardDisplayName}</th>
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
                                : this.activeGameViewTab == this.gameSetting.gameViewTabDisplayNames[GameViewTab.STORY]
                                ? <section>
                                    <table class="listBox">
                                        <thead>
                                            <tr>
                                                <th style={{width: "50%"}}>{this.gameSetting.taskModeData[2].majorRewardDisplayName[0]}</th>
                                                <th>{this.gameSetting.taskModeData[2].majorRewardDisplayName[1]}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.appState.hero.questMajorRewards.length <= 0
                                                ? <tr><td colSpan={2}>[None]</td></tr>
                                                : this.appState.hero.questMajorRewards
                                                    .map((reward: QuestMajorReward) => 
                                                        <tr {...this.findUpdate('questMajorRewards', (data: QuestMajorReward) => data.connection != null && data.groupName == reward.groupName) ? {class: 'textRow-highlight'} : {}}>
                                                            <td>{reward.connection.personName}, {reward.connection.personTitle}</td>
                                                            <td>{capitalizeInitial(reward.groupName)}</td>
                                                        </tr>
                                                    )
                                            }
                                            <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                        </tbody>
                                    </table>
                                    <table class="listBox">
                                        <thead>
                                            <tr>
                                                <th style={{width: "50%"}}>{this.gameSetting.taskModeData[2].majorRewardDisplayName[2]}</th>
                                                <th>{this.gameSetting.taskModeData[2].majorRewardDisplayName[3]}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.appState.hero.questMajorRewards.filter(a => a.office != null).length <= 0
                                                ? <tr><td colSpan={2}>[None]</td></tr>
                                                : this.appState.hero.questMajorRewards.filter(a => a.office != null)
                                                    .map((reward: QuestMajorReward) => 
                                                        <tr {...this.findUpdate('questMajorRewards', (data: QuestMajorReward) => data.office != null && data.groupName == reward.groupName) ? {class: 'textRow-highlight'} : {}}>
                                                            <td>{capitalizeInitial(reward.groupName)}</td>
                                                            <td>{reward.office.officeIterationCount > 1 ? toOrdinal(reward.office.officeIterationCount) + ' ' + this.gameSetting.officeIterationName + ' ' : ''}{reward.office.officeName}</td>
                                                        </tr>
                                                    )
                                            }
                                            <tr><td colSpan={2} class="placeholderRow"></td></tr>
                                        </tbody>
                                    </table>
                                    <p>
                                        <div sq-flex class={this.findUpdate('currency', ((data: TaskMode[]) => data.includes(TaskMode.QUEST_MODE))) ? 'textRow textRow-highlight' : 'textRow'}>
                                            <span sq-mr-auto>{this.gameSetting.taskModeData[2].currencyDisplayName}</span> {this.getCurrencyDisplayValue(this.appState.hero, TaskMode.QUEST_MODE)}
                                        </div>
                                        <div class="textRow">{this.gameSetting.taskModeData[2].buildUpLimitDisplayName}</div>
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
                                                <th>{this.gameSetting.taskModeData[2].buildUpRewardDisplayName}</th>
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
                                    <p class="niceText">
                                        Welcome to SelecQuest, with three adventuring modes! Choose between {this.gameSetting.taskModeData[0].taskModeActionName}, {this.gameSetting.taskModeData[1].taskModeActionName}, and {this.gameSetting.taskModeData[2].taskModeActionName} to earn different rewards and advance your hero. Download in the app store or save to your device's desktop for a fully immersive mobile experience!
                                    </p>
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
                        </div>
                    </div>
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
                                        ? <b style={{display: 'block', textAlign: 'center'}}>&#9733; {this.gameSetting.taskModeData[0].environmentalLimitBreakDisplayName.toLocaleUpperCase()} &#9733;</b>
                                        : <span>{this.gameSetting.taskModeData[0].environmentalLimitDisplayName}</span>
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
                                        ? <b style={{display: 'block', textAlign: 'center'}}>&#9733; {this.gameSetting.taskModeData[1].environmentalLimitBreakDisplayName.toLocaleUpperCase()} &#9733;</b>
                                        : <span>{this.gameSetting.taskModeData[1].environmentalLimitDisplayName}</span>
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
                                    ? <b style={{display: 'block', textAlign: 'center'}}>&#9733; {this.gameSetting.taskModeData[2].environmentalLimitBreakDisplayName.toLocaleUpperCase()} &#9733;</b>
                                    : <span>{this.gameSetting.taskModeData[2].environmentalLimitDisplayName}</span>

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
                            !!this.appState.currentTask
                            ? [
                                <div 
                                    class="textRow textRow-scroll"
                                    sq-scrollable
                                    onScroll={(e) => this._textRowScrollHandler(e)}
                                >{this.appState.currentTask.description}&hellip;</div>,
                                <div class="indentRow">
                                    <sq-progress-bar
                                        totalValue={this.appState.currentTask.durationMs}
                                        currentValue={this.activeTaskProgressMs}
                                        tapOverlayText={`${Math.floor(100 * this.activeTaskProgressMs / this.appState.currentTask.durationMs)}%`}
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

enum GameViewTab {
    HERO,
    GEAR,
    DEEDS,
    STORY,
    GAME,
}
