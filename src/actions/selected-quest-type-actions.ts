import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {QuestTypes} from '../models/task-types';

@Injectable()
export class SelectedQuestTypeActions {
	static SET_QUEST_TYPE = 'SET_QUEST_TYPE';
	setQuestType(newQuestType: QuestTypes): Action {
		return {
			type: SelectedQuestTypeActions.SET_QUEST_TYPE,
			payload: newQuestType
		}
	}
}