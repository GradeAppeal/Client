import { Component, Input, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Assignment } from 'src/app/shared/interfaces/psql.interface';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { CoursesComponent } from '../courses/courses.component';
import { MatDialog } from '@angular/material/dialog';
import { AddAssignmentComponent } from './add-assignment/add-assignment.component';
import { DeleteAssignmentComponent } from './delete-assignment/delete-assignment.component';
import { SupabaseService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
})
export class AssignmentsComponent {
  @Input() course: Course;
  courseId: number;
  isAssignmentsFetched = false;
  assignments: Assignment[];
  selectedAssignmentId: number;
  editMode = false;
  newAssignment: string;

  constructor(
    private sharedService: SharedService,
    private authService: SupabaseService,
    private courses: CoursesComponent,
    private dialog: MatDialog
  ) {}

  formatCourse(course: Course): string {
    return this.courses.formatCourse(course);
  }

  async ngOnInit() {
    try {
      // don't render form until course and assignment information has been fetched
      this.assignments = await this.sharedService.fetchAssignmentsForNewAppeal(
        this.course.id
      );
      this.isAssignmentsFetched = true;

      // listen for db inserts & updates
      this.authService.client
        .channel('assignment')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'Assignments' },
          (payload) => {
            // if new assignment added, update UI with new assignment
            if (payload.eventType === 'INSERT') {
              const { assignment_name, course_id, id } = payload.new;
              const newAssignment = {
                assignment_name,
                course_id,
                id,
              };
              // show new assignment
              this.assignments.push(newAssignment);
            }
            // if existing assignment deleted, update UI with deleted assignment
            else if (payload.eventType === 'DELETE') {
              const { id } = payload.old;
              // don't show deleted assignment
              this.assignments = this.assignments.filter(
                (assignment) => assignment.id != id
              );
            }
          }
        )
        .subscribe();
      //this.deleteAssignmentUpdate();
    } catch (err) {
      console.log(err);
      throw new Error('Error while fetching course information for course');
    }
  }

  /**
   * Goes to AddAssignment pop up component
   */
  async addAssignmentPopUp(
    assignments: Assignment[],
    course: Course
  ): Promise<void> {
    const dialogRef = this.dialog.open(AddAssignmentComponent, {
      width: '50%',
      height: '55%',
      data: { assignments: assignments, course: course },
    });
  }

  /**
   * Goes to DeleteAssignment pop up component
   */
  async deleteAssignmentPopUp(
    assignment: Assignment,
    course: Course
  ): Promise<void> {
    const dialogRef = this.dialog.open(DeleteAssignmentComponent, {
      width: '35%',
      height: '35%',
      data: { assignment: assignment, course: course },
    });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }
}
