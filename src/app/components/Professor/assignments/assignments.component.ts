import { Component, Input, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/auth.service';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Assignment } from 'src/app/shared/interfaces/psql.interface';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { ProfileComponent } from '../profile/profile.component';
import { MatDialog } from '@angular/material/dialog';
import { AddAssignmentComponent } from './add-assignment/add-assignment.component';
import { DeleteAssignmentComponent } from './delete-assignment/delete-assignment.component';

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
    private profile: ProfileComponent,
    private dialog: MatDialog
  ) {}

  formatCourse(course: Course): string {
    return this.profile.formatCourse(course);
  }

  async ngOnInit() {
    try {
      // don't render form until course and assignment information has been fetched
      this.assignments = await this.sharedService.fetchAssignmentsForNewAppeal(
        this.course.id
      );
      this.isAssignmentsFetched = true;
    } catch (err) {
      console.log(err);
      throw new Error('Error while fetching course information for course');
    }
  }

  deleteAssignment(index: number) {
    console.log(this.assignments[index]);
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
