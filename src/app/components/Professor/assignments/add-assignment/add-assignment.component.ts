import { Component, Inject, Optional, Input  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Assignment } from '../../../../shared/interfaces/psql.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';
import { Course } from '../../../../shared/interfaces/psql.interface';

@Component({
  selector: 'app-add-assignment',
  templateUrl: './add-assignment.component.html',
  styleUrls: ['./add-assignment.component.scss']
})
export class AddAssignmentComponent {
  newAssignment : string;
  assignments : Assignment[];
  currentCourse: Course; 

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private route: ActivatedRoute,
    private dialogRef: MatDialogRef<AddAssignmentComponent>,
    private supabase: SupabaseService,
  ) {
    this.assignments = data.assignment;
    this.currentCourse = data.course;
  }
  

  /**
   * Add assignment to database
   */
  async onAddAssignment(): Promise<void> {
    /*  add assignment to database */
    try {
      await this.supabase.insertNewAssignment(
        this.currentCourse.id,
        this.newAssignment,
      );
    } catch (err) {
      console.log(err);
      throw new Error('onAddAssignment');
    }
  /*   close pop-up */
    this.dialogRef.close();
  }

}
