import { Component } from '@angular/core';
import { SupabaseService } from 'src/app/services/auth.service';
import { StudentCourse } from 'src/app/shared/interfaces/student.interface';
import { Router } from '@angular/router';
import { StudentService } from 'src/app/services/student.service';
import { STUDENT_UUID } from 'src/app/shared/strings';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent {
  studentUserId!: string;
  studentCourses!: StudentCourse[];
  course_string: string;
  constructor(
    private readonly authService: SupabaseService,
    private readonly studentService: StudentService,
    private router: Router
  ) {}
  async ngOnInit(): Promise<void> {
    this.studentUserId = (await this.authService.getUserId()) as string;
    this.studentCourses = await this.studentService.fetchStudentCourses(
      STUDENT_UUID
    );
    console.log(this.studentCourses);
    const studentAppeals = await this.studentService.fetchStudentAppeals(
      STUDENT_UUID
    );
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
    console.log({ course });
    this.router.navigateByUrl(`/new-appeal/${course.course_id}`);
  }
}
