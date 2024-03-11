import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { StudentCourse } from 'src/app/shared/interfaces/student.interface';
import { Router } from '@angular/router';
import { StudentService } from 'src/app/services/student.service';
import { Session, User } from '@supabase/supabase-js';
import { Student } from 'src/app/shared/interfaces/psql.interface';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './grader-dashboard.component.html',
  styleUrls: ['./grader-dashboard.component.scss'],
})
export class GraderDashboardComponent {
  user: User;
  student: Student;
  studentUserId!: string;
  studentCourses!: StudentCourse[];
  course_string: string;
  constructor(
    private authService: AuthService,
    private readonly studentService: StudentService,
    private router: Router
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
        this.student = {
          id: this.user.id,
          first_name: this.user.user_metadata['first_name'],
          last_name: this.user.user_metadata['last_name'],
          email: this.user.email as string,
        };
      }
    });
  }
  async ngOnInit(): Promise<void> {
    this.studentCourses = await this.studentService.fetchGraderCourses(
      this.student.id
    );
    const studentAppeals = await this.studentService.fetchStudentAppeals(
      this.student.id
    );
  }

  /**
   * Only runs if user is a grader
   * @param course
   */
  onViewAppeal(course: StudentCourse) {
    this.course_string =
      course.course_prefix +
      course.course_code +
      '-' +
      course.course_section +
      ' - ' +
      course.professor_name;
    this.router.navigateByUrl(
      `student/grader/interaction-history/${course.course_id}`
    );
  }

  /**
   * Only runs if user is a student
   * @param course
   */
  onNewAppeal(course: StudentCourse) {
    this.course_string =
      course.course_prefix +
      course.course_code +
      '-' +
      course.course_section +
      ' - ' +
      course.professor_name;
    this.router.navigateByUrl(`/student/new-appeal/${course.course_id}`);
  }
}
