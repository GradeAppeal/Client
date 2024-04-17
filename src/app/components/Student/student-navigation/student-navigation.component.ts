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
  showGrader: boolean;
  loading: boolean = true;
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

  /**
   *  Set up page on initialization, and load page after variables have been set
   */
  async ngOnInit() {
    console.log(this.loading);
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
        if (this.selectedTab.includes('new-appeal')) {
          this.title = 'New Appeal';
        } else if (this.selectedTab.includes('interaction-history')) {
          this.title = 'Interaction History';
        }
      });

    /* Update tabs on refresh */
    this.isGrader = await this.graderService.isGrader(this.user.id);
    const storedShowStudent = localStorage.getItem('showStudent');
    this.showStudent = storedShowStudent
      ? JSON.parse(storedShowStudent)
      : false;
    const storedShowGrader = localStorage.getItem('showGrader');
    this.showGrader = storedShowGrader ? JSON.parse(storedShowGrader) : false;

    this.loading = false;
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
  /**
   *  Switch tabs to be hidden or seen and store in local storage
   */
  toggleTab(option: string) {
    if (option == 'student') {
      this.showStudent = !this.showStudent;
      localStorage.setItem('showStudent', JSON.stringify(this.showStudent));
    } else {
      this.showGrader = !this.showGrader;
      localStorage.setItem('showGrader', JSON.stringify(this.showGrader));
    }
  }
}
