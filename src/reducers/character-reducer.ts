import {ActionReducer, Action} from '@ngrx/store';
import {CharacterActions} from '../actions/character-actions';
import {ICharacter} from '../models/character-types';

let nextId = 0;

export const CharacterReducer: ActionReducer<ICharacter> = (state = {}, action: Action) => {
	switch(action.type) {
		case CharacterActions.SET_CHARACTER: 
			let newCharacter = Object.assign({}, action.payload, {id: nextId++});
			return newCharacter;
		case CharacterActions.UPDATE_CHARACTER:
			let updatedCharacter = Object.assign({}, state, action.payload);
			return updatedCharacter;
		default:
			return state;
	}
}