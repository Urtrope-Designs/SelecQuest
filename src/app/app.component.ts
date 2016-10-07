import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
// import { StatusBar } from 'ionic-native';

import { TabsPage } from '../pages/tabs/tabs';
import {TaskManagerService} from '../services/task-manager-service';


@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp {
  rootPage = TabsPage;

  constructor(
    platform: Platform,
    public taskQueueSvc: TaskManagerService 
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // StatusBar.styleDefault();
    });
  }
}
