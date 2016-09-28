import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {ITask} from '../models/task-types';

@Injectable()
export class TaskActions {
	static ADD_TASK = 'ADD_TASK';
	addTask(task: ITask): Action {
		return {
			type: TaskActions.ADD_TASK,
			payload: task
		}
	}

	static COMPLETE_TASK = 'COMPLETE_TASK';
	completeTask(task: ITask): Action {
		return {
			type: TaskActions.COMPLETE_TASK,
			payload: task
		}
	}

	static REMOVE_TASK = 'REMOVE_TASK';
	removeTask(task: ITask): Action {
		return {
			type: TaskActions.REMOVE_TASK,
			payload: task
		}
	}

}