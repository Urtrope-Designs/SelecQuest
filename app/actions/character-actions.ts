import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {ICharacter} from '../models/character-types';

@Injectable()
export class CharacterActions {
	static SET_CHARACTER = 'SET_CHARACTER';
	setCharacter(character: ICharacter): Action {
		return {
			type: CharacterActions.SET_CHARACTER,
			payload: character
		}
	}

	static UPDATE_CHARACTER = 'UPDATE_CHARACTER';
	updateCharacter(character: ICharacter): Action {
		return {
			type: CharacterActions.UPDATE_CHARACTER,
			payload: character
		}
	}

}