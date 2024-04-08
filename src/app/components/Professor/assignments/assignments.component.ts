import { Component } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Assignment } from 'src/app/shared/interfaces/psql.interface';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { MatDialog } from '@angular/material/dialog';
import { AddAssignmentComponent } from './add-assignment/add-assignment.component';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentCourseGraderInfo } from 'src/app/shared/interfaces/professor.interface';
import { ProfessorService } from 'src/app/services/professor.service';
import { EditGraderComponent } from './edit-grader/edit-grader.component';
import { Sort } from '@angular/material/sort';
import { GenericPopupComponent } from '../../generic-popup/generic-popup.component';

interface Element {
  id: number;
  grader_id?: string;
  grader_name?: string;
  assignment: string;
}

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
})
export class AssignmentsComponent {
  courseID: number;
  course: Course;
  fetchedCourse = false;
  assignments: Assignment[];
  selectedAssignmentId: number;
  editMode = false;
  newAssignment: string;
  assignmentDataSource: Element[] = [];
  displayedColumns: string[] = ['assignment', 'grader', 'options'];

  constructor(
    private route: ActivatedRoute,
    private professorService: ProfessorService,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private router: Router
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

      this.setAssignments();
      this.course = await this.sharedService.getCourse(this.courseID);
      this.fetchedCourse = true;

      // listen for db inserts & updates
      this.handleAssignmentUpdates();
    } catch (err) {
      console.log(err);
      throw new Error('Error while fetching course information for course');
    }
  }

  private setAssignments() {
    this.assignmentDataSource = this.assignments.map((assignment) => {
      return {
        id: assignment.id,
        grader_id: assignment.grader_id,
        grader_name: assignment.grader_name,
        assignment: assignment.assignment_name,
      };
    });
    this.assignmentDataSource.sort((a, b) =>
      this.compare(a.assignment, b.assignment, true)
    );
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
        // update to grader
        else if (event === 'UPDATE') {
          const { id } = record;
          this.assignments = this.assignments.map((assignment) => {
            return assignment.id === id ? record : assignment;
          });
        }
        // if assignment deleted
        else if (event === 'DELETE') {
          const { id } = record;
          // don't show deleted assignment
          this.assignments = this.assignments.filter(
            (assignment) => assignment.id != id
          );
        }
        this.setAssignments();
      });
  }

  /**
   * Goes to AddAssignment pop up component
   */
  async addAssignmentPopUp(course: Course): Promise<void> {
    const { id } = course;
    const graders: StudentCourseGraderInfo[] =
      await this.professorService.getGraders(id);
    const dialogRef = this.dialog.open(AddAssignmentComponent, {
      data: { course, graders },
    });
  }

  async editGraderPopUp(element: Element) {
    const { id, grader_id } = element;

    const graders: StudentCourseGraderInfo[] =
      await this.professorService.getGraders(this.courseID);
    const assignedGrader = graders.find(
      (grader) => grader.student_id === grader_id
    );
    this.dialog.open(EditGraderComponent, {
      data: { assignedGrader, graders, cid: this.courseID, aid: id },
    });
  }

  toggleDeleteAssignmentPopUp(aid: number) {
    const dialogRef = this.dialog.open(GenericPopupComponent, {
      data: {
        title: 'Delete Assignment?',
        message: 'Are you sure you want to delete this assignment?',
        actionButtonText: 'Delete',
        action: async () => {
          await this.professorService.deleteAssignment(aid);

          dialogRef.close();
        },
      },
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

  onBackButton() {
    this.router.navigateByUrl('professor/courses');
  }

  sortTable(sort: Sort) {
    const data = this.assignmentDataSource.map((data) => data);
    if (!sort.active || sort.direction === '') {
      this.assignmentDataSource = data;
      return;
    }

    this.assignmentDataSource = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'assignment':
          return this.compare(a.assignment, b.assignment, isAsc);

        default:
          return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
