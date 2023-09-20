import { Component } from '@angular/core';

@Component({
  selector: 'app-professor-navigation',
  templateUrl: './professor-navigation.component.html',
  styleUrls: ['./professor-navigation.component.scss']
})
export class ProfessorNavigationComponent {
  selectedTab: string = "inbox";
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
  }
}
