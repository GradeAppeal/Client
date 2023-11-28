import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  Course,
  Assignment,
  Student,
} from 'src/app/shared/interfaces/psql.interface';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import { StudentService } from 'src/app/services/student.service';
import { User } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-new-appeal',
  templateUrl: './new-appeal.component.html',
  styleUrls: ['./new-appeal.component.scss'],
})
export class NewAppealComponent implements OnInit {
  user: User;
  student: Student;
  isCourseFetched = false;
  courseId: number;
  course: Course;
  isAssignmentsFetched = false;
  assignments: Assignment[];
  selectedAssignmentId: number;
  appeal: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private studentService: StudentService
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

  navigateToHome() {
    this.router.navigate(['/']);
  }

  async ngOnInit() {
    this.courseId = this.route.snapshot.params['courseId'];
    try {
      // don't render form until course and assignment information has been fetched
      this.course = await this.studentService.fetchCourseForNewAppeal(
        this.courseId
      );
      this.isCourseFetched = true;
      this.assignments = await this.studentService.fetchAssignmentsForNewAppeal(
        this.courseId
      );
      const assignments = this.assignments;
      console.log({ assignments });
      this.isAssignmentsFetched = true;
    } catch (err) {
      console.log(err);
      throw new Error('Error while fetching course information for new appeal');
    }
  }

  /**
   * Formats course name information like shown in Moodle
   * @param course Course object containing course information
   * @returns formatted string of course (moodle format)
   */
  formatCourse(course: Course): string {
    return course.section
      ? `${course.year - 2000}${course.semester} ${course.prefix}-${
          course.code
        }-${course.section} - ${course.name}`
      : `${course.year - 2000}${course.semester} ${course.prefix}-${
          course.code
        } - ${course.name}`;
  }

  /**
   * Submit student appeal to database
   */
  async onSubmitAppeal(): Promise<void> {
    const now = getTimestampTz(new Date());
    try {
      console.log(
        this.selectedAssignmentId,
        this.appeal,
        this.courseId,
        now,
        this.student.id
      );
      const appealID = await this.studentService.insertNewAppeal(
        this.selectedAssignmentId,
        this.student.id,
        this.courseId,
        now,
        this.appeal
      );

      this.router.navigateByUrl(`student/interaction-history/${appealID}`);
    } catch (err) {
      console.log(err);
      throw new Error('onSubmitAppeal');
    }
  }
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
