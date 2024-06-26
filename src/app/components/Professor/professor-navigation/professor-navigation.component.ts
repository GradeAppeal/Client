import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { SignoutComponent } from 'src/app/components/Auth/signout/signout.component';
import { filter } from 'rxjs/operators';
import { GenericPopupComponent } from '../../generic-popup/generic-popup.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-professor-navigation',
  templateUrl: './professor-navigation.component.html',
  styleUrls: ['./professor-navigation.component.scss'],
})
export class ProfessorNavigationComponent {
  selectedTab: string = 'professor/appeal-inbox';
  title: string = 'Appeal Inbox';
  versionNumber = '1.1.2';
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private professorService: ProfessorService,
    private authService: AuthService
  ) {
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
        console.log(this.title);
        console.log(this.selectedTab);
        if (this.selectedTab.includes('roster')) {
          this.title = 'Roster';
        } else if (this.selectedTab.includes('assignments')) {
          this.title = 'Assignments';
        } else if (this.selectedTab.includes('interaction-history')) {
          this.title = 'Interaction History';
        } else if (this.selectedTab.includes('edit-templates')) {
          this.title = 'Edit Templates';
        }
      });
  }
  navigateTo(route: string) {
    this.selectedTab = route;
    this.router.navigate([route]);
  }

  async ngOnInit() {}
  openSettings() {
    console.log('opening settings');
  }

  logoutPopUp() {
    this.dialog.open(SignoutComponent, {});
  }
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
