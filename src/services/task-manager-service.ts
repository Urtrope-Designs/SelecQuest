import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {AppState} from './app-state';
import {ITask} from '../models/task-types';
import {TaskFactoryService} from './task-factory-service';
import {TaskActions} from '../actions/task-actions';

@Injectable()
export class TaskManagerService{
    public taskCheck$: Observable<any>;
    numActiveTasksAllowed = 1;
    
    constructor(
        public store: Store<AppState>,
        public taskFactory: TaskFactoryService,
        public taskActions: TaskActions
    ) {
        let task$ = this.store.select('activeTasks');
        let newCharacter$ = this.store.select('curCharacter').distinctKey('id');
        this.taskCheck$ = Observable.combineLatest(newCharacter$, task$);
        this.task$.subscribe((character: ICharacter, tasks: ITask[]) => {
            console.log('character:');
            console.dir(character);
            console.log('tasks:');
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