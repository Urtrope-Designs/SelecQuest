import {Component} from '@angular/core';
import {RecordsPage} from '../records/records';
import {CharacterPage} from '../character/character';
import {ProgressPage} from '../progress/progress';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  public tab1Root: any;
  public tab2Root: any;
  public tab3Root: any;

  constructor() {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.tab1Root = CharacterPage;
    this.tab2Root = ProgressPage;
    this.tab3Root = RecordsPage;
  }
}
