import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { navigate, setTitle } from 'src/app/shared/functions/general.util';
import { AuthService } from 'src/app/services/auth.service';
import { SignoutComponent } from 'src/app/components/Auth/signout/signout.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-student-navigation',
  templateUrl: './student-navigation.component.html',
  styleUrls: ['./student-navigation.component.scss'],
})
export class StudentNavigationComponent {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) {}
  navigateTo(route: string) {
    this.selectedTab = route;
    console.log(route);
    console.log(this.selectedTab);
    this.router.navigate([route]);
  }

  async ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.selectedTab =
          this.activatedRoute.snapshot.firstChild?.routeConfig?.path || '';
      });
    console.log(this.selectedTab);
  }

  grader = false;
  email = 'sth6@calvin.edu';
  selectedTab: string = '/student/course-dashboard';
  title: string = 'Course Dashboard';
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
  }

  logoutPopUp() {
    this.dialog.open(SignoutComponent, {});
  }
}
