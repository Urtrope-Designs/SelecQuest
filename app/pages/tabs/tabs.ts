import {Component} from '@angular/core';
import {RecordsPage} from '../records/records';
import {CharacterPage} from '../character/character';
import {ProgressPage} from '../progress/progress';

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {

  private tab1Root: any;
  private tab2Root: any;
  private tab3Root: any;

  constructor() {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.tab1Root = CharacterPage;
    this.tab2Root = ProgressPage;
    this.tab3Root = RecordsPage;
  }
}
