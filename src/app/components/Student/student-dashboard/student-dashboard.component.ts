import { Component } from '@angular/core';
import { SupabaseService } from 'src/app/services/auth.service';
import { StudentCourse } from 'src/app/shared/interfaces/student.interface';
import { Router } from '@angular/router';
import { StudentService } from 'src/app/services/student.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent {
  studentCourses!: StudentCourse[];
  course_string: string;
  constructor(
    private readonly supabase: SupabaseService,
    private readonly studentService: StudentService,
    private router: Router
  ) {}
  async ngOnInit(): Promise<void> {
    this.studentCourses = await this.studentService.fetchStudentCourses(1);
    console.log(this.studentCourses);
    const studentAppeals = await this.studentService.fetchStudentAppeals(1);
    console.log({ studentAppeals });
  }
  onNewAppeal(course: StudentCourse) {
    this.course_string =
      course.course_prefix +
      course.course_code +
      '-' +
      course.course_section +
      ' - ' +
      course.professor_name;
    this.router.navigateByUrl(`/new-appeal/${course.course_id}`);
  }
}
