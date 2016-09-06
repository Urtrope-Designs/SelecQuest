import {ActionReducer, Action} from '@ngrx/store';
import {CharacterActions} from '../actions/character.actions';

let nextId = 0;

export function CharacterReducer(state, action) {
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