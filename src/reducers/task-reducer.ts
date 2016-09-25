import {Action} from '@ngrx/store';
import {TaskActions} from '../actions/task-actions';
import {ITask} from '../models/task-types';

export function TaskReducer(state, action: Action) {
	switch(action.type) {
		case TaskActions.ADD_TASK: 
			let newCharacter = Object.assign({}, action.payload);
			return [...state, newCharacter];
		case TaskActions.COMPLETE_TASK:
			return state.map((task: ITask) => {
				if (task.id == action.payload.id) {
					return Object.assign({}, task, {isComplete: true});
				} else {
					return task;
				}
			});
		case TaskActions.REMOVE_TASK:
			return state.filter((task: ITask) => task.id != action.payload.id);
		default:
			return state;
	}
}