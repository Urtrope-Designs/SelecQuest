import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {AppState} from '../../services/app-state';
import {ITask} from '../../models/task-types';

@Component({
  templateUrl: 'progress.html'
})
export class ProgressPage {
  task$: Observable<any>;

  constructor(
    public store: Store<AppState>
  ) {
  }

  ionViewDidLoad() {
		this.task$ = this.store.select('activeTasks');
	}

  getTaskIcon(task: ITask) {
    let iconName = 'code-working';
    if (task.endTime < new Date()) {
      iconName = 'checkmark-circle-outline';
    }

    return iconName;
  }
}
