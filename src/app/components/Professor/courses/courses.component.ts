import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Course, Professor } from 'src/app/shared/interfaces/psql.interface';
import { AddCourseComponent } from './add-course/add-course.component';
import { ProfessorService } from 'src/app/services/professor.service';
import { AuthService } from 'src/app/services/auth.service';
import { Session, User } from '@supabase/supabase-js';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { GenericPopupComponent } from '../../generic-popup/generic-popup.component';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
})
export class CoursesComponent {
  course: Course;
  session: Session;
  user: User;
  professor: Professor;
  professorCourses: Course[];
  noCourses: boolean;
  fetchedCourse = false;
  currentCourseID = -1;
  currentCourse: Course;

  constructor(
    private dialog: MatDialog,
    private professorService: ProfessorService,
    private sharedService: SharedService,
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
        this.professor = {
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
      this.professorCourses = await this.professorService.fetchProfessorCourses(
        this.professor.id
      );
      this.noCourses = this.professorCourses.length === 0 ? true : false;
      this.handleCourseUpdates();
    } catch (err) {
      console.log(err);
    }
  }

  handleCourseUpdates(): void {
    this.sharedService
      .getTableChanges(
        'ProfessorCourse',
        'professor-course-channel',
        `professor_id=eq.${this.professor.id}`
      )
      .subscribe(async (update: any) => {
        const record = update.new?.course_id ? update.new : update.old;
        const event = update.eventType;
        if (!record) return;
        // if new course inserted
        if (event === 'INSERT') {
          const { course_id } = record;
          const newCourse = await this.sharedService.getCourse(course_id);
          // show new assignment
          this.professorCourses = [...this.professorCourses, newCourse];
        }
        // if course deleted
        else if (event === 'DELETE') {
          const { course_id } = record;
          // remove course from UI
          this.professorCourses = this.professorCourses.filter(
            (course) => course.id !== course_id
          );
        }
      });
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

  onViewRoster(course: Course) {
    this.router.navigateByUrl(`professor/roster/${course.id}`);
  }

  onViewAssignments(course: Course) {
    this.router.navigateByUrl(`professor/assignments/${course.id}`);
  }

  /**
   * Goes to AddCourse pop up component
   */
  async addCoursePopUp(): Promise<void> {
    const dialogRef = this.dialog.open(AddCourseComponent, {
      width: '80%',
      height: '100%',
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  toggleDeleteCoursePopup(event: Event, course: Course) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(GenericPopupComponent, {
      data: {
        title: 'Close Appeal?',
        message: 'Are you sure you want to close this appeal?',
        actionButtonText: 'Close',
        action: async () => {
          await this.professorService.deleteCourse(
            course.id,
            this.professor.id
          );
          dialogRef.close();
        },
      },
    });
  }
}
