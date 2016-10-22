import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import {StoreModule} from '@ngrx/store';

import { MyApp } from './app.component';

// pages
import {CharacterPage} from '../pages/character/character';
import {CharacterDetailsPage} from '../pages/character-details/character-details';
import {ProgressPage} from '../pages/progress/progress';
import {RecordsPage} from '../pages/records/records';
import {TabsPage} from '../pages/tabs/tabs';

// ngrx-related imports
import {CharacterReducer} from '../reducers/character-reducer';
import {CharacterActions} from '../actions/character-actions';
import {TaskReducer} from '../reducers/task-reducer';
import {TaskActions} from '../actions/task-actions';
import {SelectedQuestTypeReducer} from '../reducers/selected-quest-type-reducer';
import {SelectedQuestTypeActions} from '../actions/selected-quest-type-actions';
import {QuestTypes} from '../models/task-types';

// SQ services
import {CharacterFactoryService} from '../services/character-factory-service';
import {TaskFactoryService} from '../services/task-factory-service';
import {TaskManagerService} from '../services/task-manager-service';

const NGRX_IMPORTS = [
  StoreModule.provideStore(
    {curCharacter: CharacterReducer, activeTasks: TaskReducer, selectedQuestType: SelectedQuestTypeReducer}, 
    {curCharacter: undefined, activeTasks: [], selectedQuestType: QuestTypes.INVESTIGATING})
]

const NGRX_PROVIDERS = [
  CharacterActions,
  TaskActions,
  SelectedQuestTypeActions
];

const SQ_PROVIDERS = [
  CharacterFactoryService,
  TaskFactoryService,
  TaskManagerService
]

@NgModule({
  declarations: [
    MyApp,
    CharacterPage,
    CharacterDetailsPage,
    ProgressPage,
    RecordsPage,
    TabsPage
  ],
  imports: [
    ...NGRX_IMPORTS,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    CharacterPage,
    CharacterDetailsPage,
    ProgressPage,
    RecordsPage,
    TabsPage
  ],
  providers: [
    ...NGRX_PROVIDERS,
    ...SQ_PROVIDERS
  ]
})
export class AppModule {}
