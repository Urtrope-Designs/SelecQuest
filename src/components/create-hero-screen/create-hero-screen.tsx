import { Component, State, Event, EventEmitter, Prop } from "@stencil/core";
import { HeroStat, HeroRace, HeroClass } from "../../models/models";
import { generateRandomName, randFromList, randRange, capitalizeInitial } from "../../global/utils";
import { GameSettingsManager } from '../../services/game-settings-manager';
import { GameSetting } from "../../global/game-setting";
import { HeroInitData } from "../../models/hero-models";

@Component({
    tag: 'sq-create-hero-screen',
    styleUrl: 'create-hero-screen.css',
})
export class CreateHeroScreen {
    @Prop() gameSettingsMgr: GameSettingsManager;
    @Event() startNewHero: EventEmitter<HeroInitData>;
    @State() availableGameSettings: GameSetting[];
    @State() rolledHero: Heroling;
    @State() selectedGameSetting: GameSetting;
    private get heroRaces(): HeroRace[] {
        return this.selectedGameSetting.heroRaces;
    }
    private get heroClasses(): HeroClass[] {
        return this.selectedGameSetting.heroClasses;
    }
    private get statNames(): string[] {
        return this.selectedGameSetting.statNames;
    }

    async componentWillLoad() {
        await this.initGameSettings();
        this.rolledHero = {
            name: generateRandomName(this.selectedGameSetting),
            raceName: randFromList(this.heroRaces).raceName,
            className: randFromList(this.heroClasses).name,
            rolledStats: [this.generateRandomStats()],
            statsIndex: 0,
        }

        return Promise.resolve(true);
    }

    private async initGameSettings() {
        this.availableGameSettings = await this.gameSettingsMgr.getAllGameSettings();
        this.selectedGameSetting = this.availableGameSettings[0];

        return Promise.resolve(true);
    }

    roll() {
        this.handleChange('rolledStats', [...this.rolledHero.rolledStats, this.generateRandomStats()]);
        this.handleChange('statsIndex', this.rolledHero.rolledStats.length - 1);
    }

    unroll() {
        this.handleChange('statsIndex', Math.max(this.rolledHero.statsIndex - 1, 0));
    }

    handleChange(attribute, value) {
        let update = {};
        update[attribute] = value;
        this.rolledHero = Object.assign({}, this.rolledHero, update);
    }

    handleSubmit() {
        const newHero: HeroInitData = {
            name: this.rolledHero.name,
            raceName: this.rolledHero.raceName,
            className: this.rolledHero.className,
            stats: this.rolledHero.rolledStats[this.rolledHero.statsIndex],
            gameSettingId: this.selectedGameSetting.gameSettingId,
        }
        this.startNewHero.emit(newHero)
    }

    private generateRandomStats(): HeroStat[] {
        let stats = [];
        for (let stat of this.statNames) {
            stats.push({name: stat, value: randRange(1, 6) + randRange(1, 6) + randRange(1, 6)});
        }
        return stats;
    }

    private rerollName() {
        this.handleChange('name', generateRandomName(this.selectedGameSetting));
    }

    render() {
        return (
            <ion-page class='ion-page show-page'>
                <ion-header>
                    <div class="headlineRow">
                        <hr/>
                        <h1>SelecQuest</h1>
                        <hr/>
                    </div>
                </ion-header>
                <ion-content>
                    <section>
                        <h3>Create a new Hero</h3>
                    </section>
                    <section>
                        <div class="nameRow">
                            <label>
                                Name:
                                <input
                                    type="text"
                                    value={this.rolledHero.name} onInput={(event: any) => this.handleChange('name', event.target.value)}
                                    maxlength="24"
                                    placeholder="_"
                                    autocomplete="off" autocorrect="off" autocapitalize="off" spellCheck={false}
                                />
                            </label>
                            <button class="selected nameRerollButton" onClick={() => this.rerollName()}>Reroll</button>
                        </div>
                    </section>
                    <section>
                        <div class="listBox">
                            <div class="textRow textRow-highlight">Race</div>
                            <div class="buttonRow">
                                {
                                    this.heroRaces.map(race => 
                                        <button 
                                            {...(this.rolledHero.raceName == race.raceName ? {class: 'selected'} : {})}
                                            onClick={ () => this.handleChange('raceName', race.raceName)}
                                        >
                                            {race.raceName}
                                        </button>
                                    )
                                }
                            </div>
                        </div>
                    </section>
                    <section>
                        <div class="listBox">
                            <div class="textRow textRow-highlight">Class</div>
                            <div class="buttonRow">
                                {
                                    this.heroClasses.map(heroClass => 
                                        <button 
                                            {...(this.rolledHero.className == heroClass.name ? {class: 'selected'} : {})}
                                            onClick={ () => this.handleChange('className', heroClass.name)}
                                        >
                                            {heroClass.name}
                                        </button>
                                    )
                                }
                            </div>
                        </div>
                    </section>
                    <section>
                        <table class="listBox">
                            <thead>
                                <tr>
                                    <th style={{width: "65%"}}>Stat</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.rolledHero.rolledStats[this.rolledHero.statsIndex].map((stat: HeroStat) =>
                                        <tr><td>{capitalizeInitial(stat.name)}</td><td>{stat.value}</td></tr>
                                    )
                                }
                            </tbody>
                        </table>
                        <div class="buttonRow">
                            <button class="selected" onClick={() => this.roll()}>Roll</button>
                            <button class="selected" disabled={this.rolledHero.statsIndex==0} onClick={() => this.unroll()}>Unroll</button>
                        </div>
                    </section>
                </ion-content>
                <ion-footer>
                    <div class="soldButtonRow">
                        <button class="selected" onClick={() => this.handleSubmit()}>Sold!</button>
                    </div>
                </ion-footer>
            </ion-page>
        );
    }
}

interface Heroling {
    name: string;
    raceName: string;
    className: string;
    rolledStats: HeroStat[][];
    statsIndex: number,
}
