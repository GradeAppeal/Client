import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { SignoutComponent } from 'src/app/components/Auth/signout/signout.component';
import { filter } from 'rxjs/operators';
import { User } from '@supabase/supabase-js';
import { GraderService } from 'src/app/services/grader.service';
import { GenericPopupComponent } from '../../generic-popup/generic-popup.component';

@Component({
  selector: 'app-student-navigation',
  templateUrl: './student-navigation.component.html',
  styleUrls: ['./student-navigation.component.scss'],
})
export class StudentNavigationComponent {
  user: User;
  isGrader: boolean;
  showStudent: boolean = true;
  showGrader: boolean = false;
  expandMoreS: boolean = true;
  expandMoreG: boolean = false;
  versionNumber = '1.1.2';
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private dialog: MatDialog,
    private graderService: GraderService
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
      }
    });
  }

  navigateTo(route: string) {
    this.selectedTab = route;
    this.router.navigate([route]);
  }

  async ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.selectedTab =
          this.activatedRoute.snapshot.firstChild?.routeConfig?.path || '';
        let segments = this.selectedTab.split('/');
        this.title = segments[segments.length - 1].replace('-', ' ');
        //capitalize each first letter of the word
        this.title = this.title.replace(/\b\w/g, function (match) {
          return match.toUpperCase();
        });
      });

    this.isGrader = await this.graderService.isGrader(this.user.id);
  }

  grader = false;
  email = 'sth6@calvin.edu';
  selectedTab: string = '/student/courses';
  title: string = 'Courses';
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
  }

  // logoutPopUp() {
  //   this.dialog.open(SignoutComponent, {});
  // }
  toggleLogoutPopup() {
    console.log('what');
    const dialogRef = this.dialog.open(GenericPopupComponent, {
      data: {
        title: 'Sign Out?',
        message: 'Are you sure want to Sign Out?',
        actionButtonText: 'Sign Out',
        action: async () => {
          await this.authService.signOut();
          this.router.navigateByUrl('login');
          dialogRef.close();
        },
      },
    });
  }
}
