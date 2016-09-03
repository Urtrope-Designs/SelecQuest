import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {ICharacter} from '../models/character-types';

@Injectable()
export class CharacterActions {
	static ADD_CHARACTER = 'ADD_CHARACTER';
	addCharacter(character: ICharacter): Action {
		return {
			type: CharacterActions.ADD_CHARACTER,
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

	static DELETE_CHARACTER = 'DELETE_CHARACTER';
	deleteCharacter(character: ICharacter): Action {
		return {
			type: CharacterActions.DELETE_CHARACTER,
			payload: character
		}
	}
}