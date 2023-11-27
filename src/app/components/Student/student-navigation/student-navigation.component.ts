import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { navigate, setTitle } from 'src/app/shared/functions/general.util';
import { AuthService } from 'src/app/services/auth.service';
import { SignoutComponent } from 'src/app/components/Auth/signout/signout.component';

@Component({
  selector: 'app-student-navigation',
  templateUrl: './student-navigation.component.html',
  styleUrls: ['./student-navigation.component.scss'],
})
export class StudentNavigationComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.title = setTitle(event.url);
      }
    });
  }
  grader = false;
  email = 'sth6@calvin.edu';
  selectedTab: string = '/student/course-dashboard';
  title: string = 'Course Dashboard';
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
  }

  navigateTo(route: string) {
    this.selectedTab = route;
    navigate(this.router, route); //use the navigate function from general.utils
  }

  logoutPopUp() {
    this.dialog.open(SignoutComponent, {
      width: '30%',
      height: '25%',
    });
  }
}
