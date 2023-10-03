import { Component } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ProfessorCourse } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-professor-dashboard',
  templateUrl: './professor-dashboard.component.html',
  styleUrls: ['./professor-dashboard.component.scss'],
})
export class ProfessorDashboardComponent {
  professorCourses!: ProfessorCourse[];
  selectedTab = '';
  selectTab(tab: string) {}
  constructor(private readonly supabase: SupabaseService) {}
  async ngOnInit(): Promise<void> {
    this.professorCourses = await this.supabase.fetchProfessorCourses(1);
  }
}
