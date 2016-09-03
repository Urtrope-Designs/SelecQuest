import {Component, ChangeDetectionStrategy} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/rx';
import {AppState} from '../../services/app-state';
import {ICharacter} from '../../models/character-types';

@Component({
	templateUrl: 'build/pages/character/character.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterPage {
	private character: Observable<ICharacter>;

	constructor(
		private navCtrl: NavController,
		private store: Store<AppState>
	) {
	}

	ionViewLoaded() {
		this.character = this.store.select(state => state.curCharacter);
	}
}
