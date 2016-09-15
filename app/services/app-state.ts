import {ICharacter} from '../models/character-types';
import {ITask} from '../models/task-types';

export interface AppState {
	curCharacter: ICharacter;
	activeTasks: ITask[];
}