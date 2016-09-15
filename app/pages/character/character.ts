import {Component, ChangeDetectionStrategy} from '@angular/core';
import {NavController, ModalController} from 'ionic-angular';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/rx.KitchenSink';
import {AppState} from '../../services/app-state';
import {CharacterActions} from '../../actions/character-actions';
import {CharacterDetailsPage} from '../../pages/character-details/character-details';
import {ICharacter} from '../../models/character-types';

@Component({
	templateUrl: 'build/pages/character/character.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterPage {
	private character$: Observable<ICharacter>;

	constructor(
		private navCtrl: NavController,
		private store: Store<AppState>,
		private charActions: CharacterActions,
		private modalCtrl: ModalController
	) {
	}

	ionViewLoaded() {
		this.character$ = this.store.select(state => state.curCharacter);
	}

	showDetail(characterId: string): void {
		let charModal = this.modalCtrl.create(CharacterDetailsPage, {character: null});
		charModal.onDidDismiss((data: {character: ICharacter}) => {
			if (!!data && !!data.character) {
				this.store.dispatch(this.charActions.setCharacter(data.character));
			}
		})
		charModal.present();
	}
}
