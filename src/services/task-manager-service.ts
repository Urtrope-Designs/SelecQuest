import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctKey';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/interval';
import {Subscription} from 'rxjs/Subscription';
import {AppState} from './app-state';
import {ITask, QuestTypes} from '../models/task-types';
import {TaskFactoryService} from './task-factory-service';
import {TaskActions} from '../actions/task-actions';
import {ICharacter} from '../models/character-types';

@Injectable()
export class TaskManagerService{
    public taskCheckSubscription: Subscription;
    numActiveTasksAllowed = 1;
    
    constructor(
        public store: Store<AppState>,
        public taskFactory: TaskFactoryService,
        public taskActions: TaskActions
    ) {
 
        // let newCharacter$ = 
        this.store.select('curCharacter')
            .filter((character: ICharacter) => {
                return (!!character);
            })
            .distinctKey('id')
            .subscribe((character: ICharacter) => {
                console.log('TaskManagerService got a character!');
                //dispatch event to clear any reward buffer not for this character's id
                //dispatch event to clear any task not for this character's id
                //clear out old subscription
                if (!!this.taskCheckSubscription) {
                    this.taskCheckSubscription.unsubscribe();    
                }
                
                //subscribe to interval to check on task list for current character
                let characterTask$ = this.store.select('activeTasks')
                    .map((tasks: ITask[]) => {
                        return tasks.filter((task: ITask) => {
                            return task.characterId == character.id;
                        });
                    });

                Observable.interval(100)
                    .withLatestFrom(characterTask$, this.store.select('selectedQuestType'), (tick: any, tasks: ITask[], selectedQuestType: QuestTypes) => {
                        let activeTasks = tasks.filter((task: ITask) => {
                            return !task.isComplete;
                        })
                        //TODO: get the numActiveTasksAllowed from current character?
                        if (activeTasks.length < this.numActiveTasksAllowed) {
                            this.createAndDispatchNewTask(character, selectedQuestType);
                        } else {
                            activeTasks.map((task: ITask) => {
                                if (task.endTime <= new Date()) {
                                    this.handleCompletedTask(task, selectedQuestType);
                                }
                            })
                        }
                    }).subscribe();
            });
    }

    createAndDispatchNewTask(character: ICharacter, taskType: QuestTypes) {
        let newTask = this.taskFactory.generateTask(character, taskType);
        this.store.dispatch(this.taskActions.addTask(newTask));
    }

    handleCompletedTask(task: ITask, selectedQuestType: QuestTypes) {
        this.store.dispatch(this.taskActions.completeTask(task));
        
    }
}

