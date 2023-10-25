import { Component, Inject, Optional, Input } from '@angular/core';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Assignment } from '../../../../shared/interfaces/psql.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfessorService } from 'src/app/services/professor.service';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.scss'],
})
export class DeleteConfirmationComponent {
  assignment: Assignment;
  course: Course;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private route: ActivatedRoute,
    private dialogRef: MatDialogRef<DeleteConfirmationComponent>,
    private professorService: ProfessorService
  ) {
    this.assignment = data.assignment;
    this.course = data.course;
  }

  /**
   * Add assignment to database
   */
  async onDeleteAssignment(): Promise<void> {
    /*  add assignment to database */
    try {
      await this.professorService.deleteAssignment(this.assignment.id);
    } catch (err) {
      console.log(err);
      throw new Error('onDeleteAssignment');
    }
    /*   close pop-up */
    this.dialogRef.close();
  }
}