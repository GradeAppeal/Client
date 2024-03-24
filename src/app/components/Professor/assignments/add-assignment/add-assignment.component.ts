import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { ProfessorService } from 'src/app/services/professor.service';
import { StudentCourseGraderInfo } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-add-assignment',
  templateUrl: './add-assignment.component.html',
  styleUrls: ['./add-assignment.component.scss'],
})
export class AddAssignmentComponent {
  newAssignment: string;

  currentCourse: Course;
  errorMessage: string;
  graders: StudentCourseGraderInfo[];
  assignedGrader: StudentCourseGraderInfo | null;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddAssignmentComponent>,
    private professorService: ProfessorService
  ) {
    const { course, graders } = data;
    this.currentCourse = course;
    this.graders = graders;
  }

  /**
   * Add new assignment to course
   */
  async onAddAssignment(): Promise<void> {
    /*  add assignment to database */
    try {
      const { student_id, student_name } = this
        .assignedGrader as StudentCourseGraderInfo;

      const data = await this.professorService.insertNewAssignment(
        this.currentCourse.id,
        this.newAssignment,
        student_id,
        student_name
      );
      /*   close pop-up */
      this.dialogRef.close();
    } catch (err) {
      console.log(err);
      this.errorMessage = 'Cannot add duplicate assignment.';
    }
  }
}
