import {ActionReducer, Action} from '@ngrx/store';
import {SelectedQuestTypeActions} from '../actions/selected-quest-type-actions';
import {QuestTypes} from '../models/task-types';

export const SelectedQuestTypeReducer: ActionReducer<QuestTypes> = (state: QuestTypes, action: Action) => {
	switch(action.type) {
		case SelectedQuestTypeActions.SET_QUEST_TYPE: 
			return QuestTypes[QuestTypes[action.payload]];              //hack to handle when a number is passed in
		default:
			return state;
	}
}