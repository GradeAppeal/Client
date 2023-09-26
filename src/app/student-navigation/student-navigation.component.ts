import { Component } from '@angular/core';

@Component({
  selector: 'app-student-navigation',
  templateUrl: './student-navigation.component.html',
  styleUrls: ['./student-navigation.component.scss']
})
export class StudentNavigationComponent {
  grader = false;
  selectedTab: string = "course-dashboard";
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
  }
}
