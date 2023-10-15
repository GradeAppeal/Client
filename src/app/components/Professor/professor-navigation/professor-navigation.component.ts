import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-professor-navigation',
  templateUrl: './professor-navigation.component.html',
  styleUrls: ['./professor-navigation.component.scss'],
})
export class ProfessorNavigationComponent {
  constructor(private router: Router, private supabase: SupabaseService) {}

  email = 'victor.norman@calvin.edu';
  selectedTab: string = 'Appeal Inbox';
  selectTab(tabName: string): void {
    this.selectedTab = tabName;
  }
  navigateTo(route: string){
    this.router.navigate([route])
  }

  async ngOnInit() {
    const students = await this.supabase.fetchStudents(1);
    console.log({ students });
  }

}
