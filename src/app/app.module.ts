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

// SQ services
import {CharacterFactoryService} from '../services/character-factory-service';
import {TaskFactoryService} from '../services/task-factory-service';
import {TaskQueueingService} from '../services/task-queueing-service';

const NGRX_IMPORTS = [
  StoreModule.provideStore({curCharacter: CharacterReducer, activeTasks: TaskReducer}, {curCharacter: undefined, activeTasks: [])
]

const NGRX_PROVIDERS = [
  CharacterActions,
  TaskActions
];

const SQ_PROVIDERS = [
  CharacterFactoryService,
  TaskFactoryService,
  TaskQueueingService
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
