import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { SignoutComponent } from 'src/app/components/Auth/signout/signout.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-professor-navigation',
  templateUrl: './professor-navigation.component.html',
  styleUrls: ['./professor-navigation.component.scss'],
})
export class ProfessorNavigationComponent {
  selectedTab: string = 'professor/appeal-inbox';
  title: string = 'Appeal Inbox';
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private professorService: ProfessorService
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
        let segments = this.selectedTab.split('/');
        this.title = segments[segments.length - 1].replace('-', ' ');
        //capitalize each first letter of the word
        this.title = this.title.replace(/\b\w/g, function (match) {
          return match.toUpperCase();
        });
      });

    console.log(this.title);
    const students = await this.professorService.fetchStudents(1);
    console.log(this.selectedTab);
  }

  logoutPopUp() {
    this.dialog.open(SignoutComponent, {});
  }
}
