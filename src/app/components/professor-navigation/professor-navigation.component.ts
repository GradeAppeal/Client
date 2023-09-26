import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-professor-navigation',
  templateUrl: './professor-navigation.component.html',
  styleUrls: ['./professor-navigation.component.scss']
})
export class ProfessorNavigationComponent {
  constructor(private router: Router) { }

  email = "victor.norman@calvin.edu";
  selectedTab: string = "Appeal Inbox";
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
  }
  navigateToHome(){
    this.router.navigate(['/'])
  }
}
