import { Component, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { setTitle } from 'src/app/shared/functions/general.util';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-professor-navigation',
  templateUrl: './professor-navigation.component.html',
  styleUrls: ['./professor-navigation.component.scss'],
})
export class ProfessorNavigationComponent {
  email = 'victor.norman@calvin.edu';
  selectedTab: string = 'Appeal Inbox';
  title: string = 'Appeal Inbox';
  constructor(
    private router: Router,
    private professorService: ProfessorService
  ) {}
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
  }
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  async ngOnInit() {
    const students = await this.professorService.fetchStudents(1);
    console.log({ students });
  }
}
