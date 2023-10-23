import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-student-navigation',
  templateUrl: './student-navigation.component.html',
  styleUrls: ['./student-navigation.component.scss']
})
export class StudentNavigationComponent {
  constructor(private router: Router) { }
  grader = false;
  email = "sth6@calvin.edu";
  selectedTab: string = "Course Dashboard";
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
  }
  navigateToHome() {
    this.router.navigate(['/'])
  }
  navigateTo(route: string){
    this.router.navigate([route])
  }
}
