import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { SignoutComponent } from 'src/app/components/Auth/signout/signout.component';

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
    private dialog: MatDialog,
    private professorService: ProfessorService
  ) {}
  navigateTo(route: string) {
    this.selectedTab = route;
    console.log(route);
    this.router.navigate([route]);
  }

  async ngOnInit() {
    const students = await this.professorService.fetchStudents(1);
    console.log(this.selectedTab);
  }

  logoutPopUp() {
    this.dialog.open(SignoutComponent, {
      width: '30%',
      height: '25%',
    });
  }
}
