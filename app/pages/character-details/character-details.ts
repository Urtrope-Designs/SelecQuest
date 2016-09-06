import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import {CharacterFactoryService} from '../../services/character-factory-service';
import {ICharacter} from '../../models/character-types';

@Component({
 	templateUrl: 'build/pages/character-details/character-details.html',
})
export class CharacterDetailsPage {
	private characterId: string;
	private character: ICharacter;

 	constructor(private viewCtrl: ViewController, private characterFactory: CharacterFactoryService, navParams: NavParams) {
  		this.characterId = navParams.get('characterId');
  	}

  	ionViewWillLoad() {
  		if (!!this.characterId) {
  			//TODO: load character from store
  		} else {
  			this.character = this.characterFactory.generateRandomBaseCharacter();
  		}
  	}

  	dismiss() {
  		//TODO: warn user that this will discard unsaved changes?
  		this.viewCtrl.dismiss();
  	}

  	submit() {
  		//TODO: save updated character to store
  	}

}
