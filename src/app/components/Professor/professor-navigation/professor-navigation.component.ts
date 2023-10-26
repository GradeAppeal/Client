import { Component, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';
import { setTitle } from 'src/app/shared/functions/general.util';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-professor-navigation',
  templateUrl: './professor-navigation.component.html',
  styleUrls: ['./professor-navigation.component.scss'],
})
export class ProfessorNavigationComponent {
  email = 'victor.norman@calvin.edu';
  selectedTab: string = 'professor/appeal-inbox';
  title: string = 'Appeal Inbox';
  constructor(private router: Router, private supabase: SupabaseService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.title = setTitle(event.url);
      }
    });
  }
  navigateTo(route: string) {
    this.selectedTab = route;
    this.router.navigate([route]);
  }

  async ngOnInit() {
    const students = await this.supabase.fetchStudents(1);
    console.log({ students });
  }
}
