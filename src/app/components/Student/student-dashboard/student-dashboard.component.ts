import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { StudentCourse } from 'src/app/shared/interfaces/student.interface';
import { Router } from '@angular/router';
import { StudentService } from 'src/app/services/student.service';
import { User } from '@supabase/supabase-js';
import { Student } from 'src/app/shared/interfaces/psql.interface';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent {
  user: User;
  student: Student;
  studentUserId!: string;
  studentCourses!: StudentCourse[];
  course_string: string;
  constructor(
    private authService: AuthService,
    private readonly studentService: StudentService,
    private sharedService: SharedService,
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
    try {
      this.studentCourses = await this.studentService.fetchStudentCourses(
        this.student.id
      );
      this.handleCourseUpdates();
    } catch (err) {
      console.log({ err });
    }
  }

  handleCourseUpdates(): void {
    this.sharedService
      .getTableChanges(
        'StudentCourse',
        'studentcourse-update-channel',
        `student_id=eq.${this.student.id}`
      )
      .subscribe(async (update: any) => {
        const record = update.new?.course_id ? update.new : update.old;
        const event = update.eventType;
        if (!record) return;

        // student added to course roster
        if (event === 'INSERT') {
          const newCourse = await this.studentService.getStudentCourse(
            this.student.id,
            record.course_id
          );
          this.studentCourses.push(newCourse[0]);
        }
        // toggle grader status
        else if (event === 'UPDATE') {
          // remove from student view if grader
          if (record.is_grader) {
            this.studentCourses = this.studentCourses.filter(
              (studentCourse) => studentCourse.course_id !== record.course_id
            );
          }
          // add back to student view if unaassigned as grader
          else {
            const newCourse = await this.studentService.getStudentCourse(
              this.student.id,
              record.course_id
            );
            this.studentCourses.push(newCourse[0]);
          }
        }
        // remove course from dashboard
        else if (event === 'DELETE') {
          this.studentCourses = this.studentCourses.filter(
            (studentCourse) => studentCourse.course_id !== record.course_id
          );
        }
      });
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
