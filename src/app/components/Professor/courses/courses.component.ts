import { Component, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { OnChanges } from '@angular/core';
import { AddCourseComponent } from './add-course/add-course.component';
import { DeleteCourseComponent } from './delete-course/delete-course.component';
import { ProfessorService } from 'src/app/services/professor.service';
import { SupabaseService } from 'src/app/services/auth.service';
import { Session, User } from '@supabase/supabase-js';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
})
export class CoursesComponent {
  session: Session;
  user: User;
  professorCourses!: Course[];
  fetchedCourses = false;
  fetchedCourse = false;
  currentPage = 'view';
  currentCourseID = -1;
  currentCourse: Course;

  constructor(
    private dialog: MatDialog,
    private professorService: ProfessorService,
    private authService: SupabaseService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.session = (await this.authService.getSession()) as Session;
      this.user = this.session.user;
      this.professorCourses = await this.professorService.fetchProfessorCourses(
        this.user.id
      );
      this.fetchedCourses = true;
    } catch (err) {
      console.log(err);
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

  async swapView(page: string, courseID: number, course: Course) {
    this.currentPage = page;
    this.currentCourseID = courseID;
    this.currentCourse = course;
  }

  /**
   * Goes to AddCourse pop up component
   */
  async addCoursePopUp(): Promise<void> {
    const dialogRef = this.dialog.open(AddCourseComponent, {
      width: '80%',
      height: '80%',
      data: {},
    });
  }

  /**
   * Goes to DeleteCourse pop up component
   */
  async deleteCoursePopUp(event: Event, course: Course): Promise<void> {
    /* prevent navigation to different view */
    event.stopPropagation();
    const dialogRef = this.dialog.open(DeleteCourseComponent, {
      width: '50%',
      height: '55%',
      data: { course: course },
    });
  }
}
