import { Component } from "../../../node_modules/@stencil/core";

@Component({
    tag: 'sq-game-menu',
})
export class GameMenu {
    render() {
        return (
            <ion-list>
                <ion-item>
                    New Hero
                </ion-item>
                <ion-item>
                    Switch Hero
                </ion-item>
                <ion-item>
                    Delete Hero
                </ion-item>
                <ion-item>
                    Reset Data
                </ion-item>
            </ion-list>
            );
    }
}