import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import {CharacterFactoryService} from '../../services/character-factory-service';
import {ICharacter} from '../../models/character-types';

@Component({
 	templateUrl: 'build/pages/character-details/character-details.html',
})
export class CharacterDetailsPage {
	private character: ICharacter;

 	constructor(
 		private viewCtrl: ViewController, 
 		private characterFactory: CharacterFactoryService, 
 		navParams: NavParams
	) {
  		this.character = navParams.get('character');
  	}

  	ngOnInit() {
  		if (!this.character) {
  			this.character = this.characterFactory.generateRandomBaseCharacter();
  		}
  	}

  	dismiss() {
  		//TODO: warn user that this will discard unsaved changes?
  		this.viewCtrl.dismiss();
  	}

  	submit() {
  		this.viewCtrl.dismiss({character: this.character});
  	}

}
