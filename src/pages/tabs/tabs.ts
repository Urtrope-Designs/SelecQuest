import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '../../services/app-state';
import {RecordsPage} from '../records/records';
import {CharacterPage} from '../character/character';
import {ProgressPage} from '../progress/progress';
import {ICharacter} from '../../models/character-types';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  hasCharacter: boolean;
  public tab1Root: any;
  public tab2Root: any;
  public tab3Root: any;

  constructor(public store: Store<AppState>) {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.tab1Root = CharacterPage;
    this.tab2Root = ProgressPage;
    this.tab3Root = RecordsPage;
  }

  ionViewDidLoad() {
    let character$ = this.store.select('curCharacter');
    character$.subscribe((character: ICharacter) => {
      this.hasCharacter = !!character;
    })
  }

}
