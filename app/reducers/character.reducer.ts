import {ActionReducer, Action} from '@ngrx/store';
import {CharacterActions} from '../actions/character.actions';

let nextId = 0;

export function CharacterReducer(state = [], action) {
	switch(action.type) {
		case CharacterActions.ADD_CHARACTER: 
			let newCharacter = Object.assign({}, action.payload, {id: nextId++});
			return [...state, newCharacter];
		case CharacterActions.UPDATE_CHARACTER:
			return state.map(character => {
				if (character.id === action.payload.id) {
					//TODO: make this update smarter
					let updatedCharacter = Object.assign({}, character, action.payload);
					return updatedCharacter;
				} else {
					return character;	
				}
			});
		case CharacterActions.DELETE_CHARACTER:
			return state.filter(character => character.id !== action.payload.id);
		default:
			return state;
	}
}