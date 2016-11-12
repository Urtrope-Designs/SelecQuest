import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import {AppState} from '../../services/app-state';
import {ITask, QuestTypes} from '../../models/task-types';
import {ICharacter} from '../../models/character-types';
import {RewardTypes} from '../../models/reward-types';
import {SelectedQuestTypeActions} from '../../actions/selected-quest-type-actions';

@Component({
  templateUrl: 'progress.html'
})
export class ProgressPage {
  task$: Observable<ITask[]>;
  curTime: Date = new Date();
  RewardTypes = RewardTypes;
  QuestTypes = QuestTypes;
  QuestTypeValues = [QuestTypes.INVESTIGATING, QuestTypes.GLADIATING, QuestTypes.LOOTING];
  selectedQuestType;

  constructor(
    public store: Store<AppState>,
    public selectedQuestTypeActions: SelectedQuestTypeActions
  ) {
  }

  ionViewDidLoad() {
		this.task$ = this.store.select('activeTasks')
      .withLatestFrom(this.store.select('curCharacter'))
      .map((results: [ITask[], ICharacter]) => {
        let tasksForCurChar = results[0].filter((task: ITask) => {
          return task.characterId == results[1].id;
        });

        tasksForCurChar.sort((a: ITask, b: ITask) => {
          return b.endTime.getTime() - a.endTime.getTime();
        });

        return tasksForCurChar;
      });

    Observable.interval(100)
      .subscribe(() => {
        this.curTime = new Date();
      });

    this.store.select('selectedQuestType')
      .subscribe((selectedQuestType: QuestTypes) => {
        this.selectedQuestType = selectedQuestType;
        console.log('ProgressPage.selectedQuestType: ' + this.selectedQuestType);
      })
	}

  updateSelectedQuestType(newSelectedQuestType: QuestTypes) {
    console.log('ProgressPage.updateSelectedQuestType():')
    console.dir(newSelectedQuestType);
    this.store.dispatch(this.selectedQuestTypeActions.setQuestType(newSelectedQuestType));
  }

}
