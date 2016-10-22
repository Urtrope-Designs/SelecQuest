import {Component, ChangeDetectionStrategy} from '@angular/core';
import {NavController, ModalController} from 'ionic-angular';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/rx';
import {AppState} from '../../services/app-state';
import {CharacterActions} from '../../actions/character-actions';
import {CharacterDetailsPage} from '../../pages/character-details/character-details';
import {ICharacter} from '../../models/character-types';

@Component({
	templateUrl: 'character.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterPage {
	public character$: Observable<any>;

	constructor(
		public navCtrl: NavController,
		public store: Store<AppState>,
		public charActions: CharacterActions,
		public modalCtrl: ModalController
	) {
	}

	ionViewDidLoad() {
		this.character$ = this.store.select('curCharacter');
		this.character$.subscribe((character: ICharacter) => {
			if (!character) {
				this.showDetail(null);
			}
		})
	}

	showDetail(characterId: string): void {
		let charModal = this.modalCtrl.create(CharacterDetailsPage, {character: null});
		charModal.onDidDismiss((data: {character: ICharacter}) => {
			if (!!data && !!data.character) {
				let action = this.charActions.setCharacter(data.character);
				this.store.dispatch(action);
			}
		})
		charModal.present();
	}
}
