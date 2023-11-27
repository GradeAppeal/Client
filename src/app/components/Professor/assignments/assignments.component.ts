import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Assignment } from 'src/app/shared/interfaces/psql.interface';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { MatDialog } from '@angular/material/dialog';
import { AddAssignmentComponent } from './add-assignment/add-assignment.component';
import { DeleteAssignmentComponent } from './delete-assignment/delete-assignment.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
})
export class AssignmentsComponent {
  courseID: number;
  course: Course;
  isAssignmentsFetched = false;
  courseFetched = false;
  assignments: Assignment[];
  selectedAssignmentId: number;
  editMode = false;
  newAssignment: string;

  constructor(
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private dialog: MatDialog
  ) {
    this.route.params.subscribe((params) => {
      this.courseID = +params['id']; // Convert the parameter to a number
    });
  }

  async ngOnInit() {
    try {
      // don't render form until course and assignment information has been fetched
      this.assignments = await this.sharedService.fetchAssignmentsForNewAppeal(
        this.courseID
      );
      this.isAssignmentsFetched = true;
      this.course = await this.sharedService.getCourse(
        this.courseID
      );

      // listen for db inserts & updates
      this.handleAssignmentUpdates();
    } catch (err) {
      console.log(err);
      throw new Error('Error while fetching course information for course');
    }
  }

  /**
   * Receive database changes and update UI accordingly
   */
  handleAssignmentUpdates(): void {
    this.sharedService
      .getTableChanges('Assignments', 'assignments-channel')
      .subscribe((update: any) => {
        // if insert event, get new row
        // if delete event, get deleted row ID
        const record = update.new?.id ? update.new : update.old;
        // INSERT or DELETE
        const event = update.eventType;

        if (!record) return;
        // if new assignment inserted
        if (event === 'INSERT') {
          const { assignment_name, course_id, id } = record;
          const newAssignment = {
            assignment_name,
            course_id,
            id,
          };
          // show new assignment
          this.assignments.push(newAssignment);
        }
        // if assignment deleted
        else if (event === 'DELETE') {
          const { id } = record;
          // don't show deleted assignment
          this.assignments = this.assignments.filter(
            (assignment) => assignment.id != id
          );
        }
      });
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
}
