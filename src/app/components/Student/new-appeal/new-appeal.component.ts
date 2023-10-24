import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from 'src/app/services/auth.service';
import { Course, Assignment } from 'src/app/shared/interfaces/psql.interface';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import { StudentService } from 'src/app/services/student.service';

@Component({
  selector: 'app-new-appeal',
  templateUrl: './new-appeal.component.html',
  styleUrls: ['./new-appeal.component.scss'],
})
export class NewAppealComponent implements OnInit {
  email = 'sth6@calvin.edu';
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
    private supabase: SupabaseService,
    private studentService: StudentService
  ) {}

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

  submitAppeal() {
    console.log(this.appeal);
    this.navigateTo('/student/interaction-history/31'); //TODO fix the id, get the actual appeal id somehow

    //this.navigateTo('/student/interaction-history/' + this.appeal);
    //this.onSubmitAppeal();
  }
  /**
   * Submit student appeal to database
   */
  async onSubmitAppeal(): Promise<void> {
    const now = getTimestampTz(new Date());
    try {
      // await this.supabase.insertNewAppeal(
      //   this.selectedAssignmentId,
      //   1,
      //   this.courseId,
      //   now,
      //   this.appeal,
      //   90
      // );
    } catch (err) {
      console.log(err);
      throw new Error('onSubmitAppeal');
    }
  }
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
