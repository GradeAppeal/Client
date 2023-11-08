import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Assignment } from 'src/app/shared/interfaces/psql.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from 'src/app/services/auth.service';
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

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddAssignmentComponent>,
    private professorService: ProfessorService
  ) {
    this.assignments = data.assignment;
    console.log({ data });
    this.currentCourse = data.course;
  }

  /**
   * Submit student appeal to database
   */
  async onAddAssignment(): Promise<void> {
    /*  add assignment to database */
    try {
      await this.professorService.insertNewAssignment(
        this.currentCourse.id,
        this.newAssignment
      );
    } catch (err) {
      console.log(err);
      throw new Error('onAddAssignment');
    }
    /*   close pop-up */
    this.dialogRef.close();
  }
}
