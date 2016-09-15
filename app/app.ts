import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {provideStore} from '@ngrx/store';
import {StatusBar} from 'ionic-native';
import {TabsPage} from './pages/tabs/tabs';
import {CharacterActions} from './actions/character-actions';
import {TaskActions} from './actions/task-actions';
import {CharacterReducer} from './reducers/character-reducer';
import {TaskReducer} from './reducers/task-reducer';
import {CharacterFactoryService} from './services/character-factory-service';
import {TaskFactoryService} from './services/task-factory-service';

const NGRX_PROVIDERS = [
  provideStore({curCharacter: CharacterReducer}), 
  CharacterActions,
  provideStore({activeTasks: TaskReducer}),
  TaskActions
];

const SQ_PROVIDERS = [
  CharacterFactoryService,
  TaskFactoryService
]

let sqProviders = [...NGRX_PROVIDERS, ...SQ_PROVIDERS];

@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MyApp {

  private rootPage: any;

  constructor(private platform: Platform) {
    this.rootPage = TabsPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }
}

ionicBootstrap(MyApp, [sqProviders]);
