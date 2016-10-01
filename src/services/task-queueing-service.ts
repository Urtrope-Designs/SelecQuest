import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {AppState} from './app-state';
import {ITask} from '../models/task-types';
import {TaskFactoryService} from './task-factory-service';
import {TaskActions} from '../actions/task-actions';

@Injectable()
export class TaskQueueingService{
    public task$: Observable<any>;
    numActiveTasksAllowed = 1;
    
    constructor(
        public store: Store<AppState>,
        public taskFactory: TaskFactoryService,
        public taskActions: TaskActions
    ) {
        this.task$ = this.store.select('activeTasks');
        this.task$.subscribe((tasks: ITask[]) => {
            console.dir(tasks);
            //TODO: get the numActiveTasksAllowed from current character?
            if (tasks.length < this.numActiveTasksAllowed) {
                //TODO: pull the task type from current character settings
                let newTask = this.taskFactory.generateTask(null);
                this.store.dispatch(this.taskActions.addTask(newTask));
            }
        })
    }

}