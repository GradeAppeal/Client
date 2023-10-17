import { Component, Input, OnInit } from '@angular/core';
import { SupabaseService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Assignment } from 'src/app/shared/interfaces/psql.interface';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { ProfileComponent } from '../components/Professor/profile/profile.component';
import { MatDialog } from '@angular/material/dialog';
import { AddAssignmentComponent } from '../add-assignment/add-assignment.component';
import { SharedService } from '../services/shared.service';

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
   * Add new assignment to database
   */
  async addAssignment(
    assignments: Assignment[],
    course: Course
  ): Promise<void> {
    const dialogRef = this.dialog.open(AddAssignmentComponent, {
      width: '75%',
      height: '75%',
      data: { assignments: assignments, course: course },
    });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }
}
