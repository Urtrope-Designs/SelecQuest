import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {provideStore} from '@ngrx/store';
import {StatusBar} from 'ionic-native';
import {TabsPage} from './pages/tabs/tabs';
import {CharacterActions} from './actions/character.actions';
import {CharacterReducer} from './reducers/character.reducer';


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

ionicBootstrap(MyApp, [provideStore({curCharacter: CharacterReducer}), CharacterActions]);
