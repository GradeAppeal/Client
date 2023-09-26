import { Component } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { StudentCourse } from 'src/app/shared/student.interface';
@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent {
  studentCourses!: StudentCourse[];

  constructor(private readonly supabase: SupabaseService) {}
  async ngOnInit(): Promise<void> {
    this.studentCourses = await this.supabase.fetchStudentCourses(1);
    console.log(this.studentCourses);
  }
}
