import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProfessorService } from 'src/app/services/professor.service';

@Component({
  selector: 'app-professor-navigation',
  templateUrl: './professor-navigation.component.html',
  styleUrls: ['./professor-navigation.component.scss'],
})
export class ProfessorNavigationComponent {
  constructor(
    private router: Router,
    private professorService: ProfessorService
  ) {}

  email = 'victor.norman@calvin.edu';
  selectedTab: string = 'Appeal Inbox';
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
