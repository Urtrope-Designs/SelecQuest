import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import {CharacterFactoryService} from '../../services/character-factory-service';
import {ICharacter} from '../../models/character-types';

@Component({
 	templateUrl: 'character-details.html',
})
export class CharacterDetailsPage {
	public character: ICharacter;

 	constructor(
 		public viewCtrl: ViewController, 
 		public characterFactory: CharacterFactoryService, 
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
