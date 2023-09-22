import { Component } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent {
  constructor(private readonly supabase: SupabaseService) {}
  async ngOnInit(): Promise<void> {
    const studentCourses = await this.supabase.fetchStudentCourses(1);
    const allCourses = await this.supabase.fetchAllCourses();
    console.log({ studentCourses });
    console.log({ allCourses });
  }
}
