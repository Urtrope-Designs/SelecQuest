import {ICharacter} from '../models/character-types';
import {ITask, QuestTypes} from '../models/task-types';

export interface AppState {
	curCharacter: ICharacter;
	activeTasks: ITask[];
	selectedQuestType: QuestTypes;
}