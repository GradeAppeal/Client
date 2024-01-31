import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Assignment } from 'src/app/shared/interfaces/psql.interface';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { ProfessorService } from 'src/app/services/professor.service';

@Component({
  selector: 'app-add-assignment',
  templateUrl: './add-assignment.component.html',
  styleUrls: ['./add-assignment.component.scss'],
})
export class AddAssignmentComponent {
  newAssignment: string;
  assignments: Assignment[];
  currentCourse: Course;
  errorMessage: string;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddAssignmentComponent>,
    private professorService: ProfessorService
  ) {
    this.assignments = data.assignment;
    this.currentCourse = data.course;
  }

  /**
   * Add new assignment to course
   */
  async onAddAssignment(): Promise<void> {
    /*  add assignment to database */
    try {
      // if (this.newAssignment not in assignments){

      // }
      console.log(this.assignments);
      const data = await this.professorService.insertNewAssignment(
        this.currentCourse.id,
        this.newAssignment
      );
      /*   close pop-up */
      this.dialogRef.close();
      console.log({ data });
    } catch (err) {
      console.log(err);
      this.errorMessage = 'Cannot add duplicate assignment.';
    }
  }
}
