import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../services/auth.service';
import { Course, Assignment } from 'src/app/shared/interfaces/psql.interface';
import { getTimestampTz } from '../../../shared/functions/time.util';
import { StudentService } from 'src/app/services/student.service';
import { SharedService } from 'src/app/services/shared.service';

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
  grade: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private supabase: SupabaseService,
    private studentService: StudentService,
    private sharedService: SharedService
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
      this.assignments = await this.sharedService.fetchAssignmentsForNewAppeal(
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

  /**
   * Submit student appeal to database
   */
  async onSubmitAppeal(): Promise<void> {
    const now = getTimestampTz(new Date());
    try {
      await this.studentService.insertNewAppeal(
        this.selectedAssignmentId,
        this.appeal,
        this.courseId,
        now,
        1,
        this.grade
      );
      this.navigateToInteractionHistory();
    } catch (err) {
      console.log(err);
      throw new Error('onSubmitAppeal');
    }
  }
  navigateToInteractionHistory() {
    this.router.navigate(['/student-navigation/student-interaction-history']);
  }
}
