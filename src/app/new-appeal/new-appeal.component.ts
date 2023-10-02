import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { Course, Assignment } from 'src/app/shared/psql.interface';

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
  selected_assignment: string;
  appeal: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private supabase: SupabaseService
  ) {}
  navigateToHome() {
    this.router.navigate(['/']);
  }
  async ngOnInit() {
    this.courseId = this.route.snapshot.params['courseId'];
    try {
      this.course = await this.supabase.fetchCourseForNewAppeal(this.courseId);
      this.isCourseFetched = true;
      this.assignments = await this.supabase.fetchAssignmentsForNewAppeal(
        this.courseId
      );
      this.isAssignmentsFetched = true;
    } catch (err) {
      console.log(err);
      throw new Error('Error while fetching course information for new appeal');
    }
  }

  getSelectedAssignment() {
    return this.selected_assignment;
  }

  getAppeal() {
    return this.appeal;
  }

  formatCourse(course: Course): string {
    return course.section
      ? `${course.year - 2000}${course.semester} ${course.prefix}-${
          course.code
        }-${course.section} - ${course.name}`
      : `${course.year - 2000}${course.semester} ${course.prefix}-${
          course.code
        } - ${course.name}`;
  }
}
