import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription'
import {AppState} from '../../services/app-state';
import {ITask} from '../../models/task-types';
import {ICharacter} from '../../models/character-types';

@Component({
  templateUrl: 'progress.html'
})
export class ProgressPage {
  task$: Observable<ITask[]>;
  curTime: Date = new Date();

  constructor(
    public store: Store<AppState>
  ) {
  }

  ionViewDidLoad() {
		this.task$ = this.store.select('activeTasks')
      .withLatestFrom(this.store.select('curCharacter'))
      .map((results: [ITask[], ICharacter]) => {
        let tasksForCurChar = results[0].filter((task: ITask) => {
          return task.characterId == results[1].id;
        });
        return tasksForCurChar;
      });

    Observable.interval(100)
      .subscribe(() => {
        this.curTime = new Date();
      });
	}

}
