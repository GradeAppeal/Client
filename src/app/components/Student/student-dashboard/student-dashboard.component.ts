import { Component } from '@angular/core';
import { SupabaseService } from 'src/app/services/auth.service';
import { StudentCourse } from 'src/app/shared/interfaces/student.interface';
import { Router } from '@angular/router';
import { StudentService } from 'src/app/services/student.service';
import { Session, User } from '@supabase/supabase-js';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent {
  session: Session;
  user: User;
  studentUserId!: string;
  studentCourses!: StudentCourse[];
  course_string: string;
  constructor(
    private authService: SupabaseService,
    private readonly studentService: StudentService,
    private router: Router
  ) {}
  async ngOnInit(): Promise<void> {
    this.session = (await this.authService.getSession()) as Session;
    this.user = this.session.user;
    this.studentCourses = await this.studentService.fetchStudentCourses(
      this.user.id
    );
    const studentAppeals = await this.studentService.fetchStudentAppeals(
      this.user.id
    );
    console.log({ studentAppeals });
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
    console.log({ course });
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
    console.log({ course });
    this.router.navigateByUrl(`/new-appeal/${course.course_id}`);
  }
}
