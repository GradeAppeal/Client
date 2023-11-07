import { Component, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
  selectedTab: string = 'professor/appeal-inbox';
  title: string = 'Appeal Inbox';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: SupabaseService,
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

  async logout() {
    try {
      await this.authService.signOut();
      console.log('sign out!');
      this.navigateTo('/');
    } catch (error) {
      console.log({ error });
    }
  }
}
