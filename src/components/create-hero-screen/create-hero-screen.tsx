import { Component, State, Event, EventEmitter } from "@stencil/core";
import { HeroStats } from "../../helpers/models";
import { generateRandomName, randFromList, randRange } from "../../helpers/utils";
import { RACES, CLASSES } from "../../global/config";
import { createNewHero } from "../../helpers/hero-manager";

@Component({
    tag: 'sq-create-hero-screen',
    styleUrl: 'create-hero-screen.scss',
})
export class CreateHeroScreen {
    @State() rolledHero: Heroling;
    @Event() startNewHero: EventEmitter

    componentWillLoad() {
        this.rolledHero = {
            name: generateRandomName(),
            raceName: randFromList(RACES).raceName,
            className: randFromList(CLASSES),
            rolledStats: [generateRandomStats()],
            statsIndex: 0,
        }
    }

    roll() {
        this.handleChange('rolledStats', [...this.rolledHero.rolledStats, generateRandomStats()]);
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
        const newHero = createNewHero(this.rolledHero.name, this.rolledHero.raceName, this.rolledHero.className, this.rolledHero.rolledStats[this.rolledHero.statsIndex]);
        this.startNewHero.emit(newHero)
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
                        <div>
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
                        </div>
                    </section>
                    <section>
                        <div class="listBox">
                            <div class="textRow textRow-highlight">Race</div>
                            <div class="buttonRow">
                                {
                                    RACES.map(race => 
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
                                    CLASSES.map(className => 
                                        <button 
                                            {...(this.rolledHero.className == className ? {class: 'selected'} : {})}
                                            onClick={ () => this.handleChange('className', className)}
                                        >
                                            {className}
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
                                <tr><td>Str</td><td>{this.rolledHero.rolledStats[this.rolledHero.statsIndex].str}</td></tr>
                                <tr><td>Dex</td><td>{this.rolledHero.rolledStats[this.rolledHero.statsIndex].dex}</td></tr>
                                <tr><td>Con</td><td>{this.rolledHero.rolledStats[this.rolledHero.statsIndex].con}</td></tr>
                                <tr><td>Wis</td><td>{this.rolledHero.rolledStats[this.rolledHero.statsIndex].wis}</td></tr>
                                <tr><td>Int</td><td>{this.rolledHero.rolledStats[this.rolledHero.statsIndex].int}</td></tr>
                                <tr><td>Cha</td><td>{this.rolledHero.rolledStats[this.rolledHero.statsIndex].cha}</td></tr>
                            </tbody>
                        </table>
                        <div class="buttonRow">
                            <button class="selected" onClick={() => this.roll()}>Roll</button>
                            <button class="selected" disabled={this.rolledHero.statsIndex==0} onClick={() => this.unroll()}>Unroll</button>
                        </div>
                    </section>
                    <section>
                        <div style={{textAlign:'right'}}>
                            <button class="selected" onClick={() => this.handleSubmit()}>Sold!</button>
                        </div>
                    </section>
                </ion-content>
            </ion-page>
                        
        );
    }
}

interface Heroling {
    name: string;
    raceName: string;
    className: string;
    rolledStats: HeroStats[];
    statsIndex: number,
}

function generateRandomStats(): HeroStats {
    let stats = new HeroStats();
    for (let stat in stats) {
        stats[stat] = randRange(1, 6) + randRange(1, 6) + randRange(1, 6);
    }
    return stats;
}