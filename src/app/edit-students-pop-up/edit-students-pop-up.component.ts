import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Student } from '../shared/interfaces/psql.interface';

@Component({
  selector: 'app-edit-students-pop-up',
  templateUrl: './edit-students-pop-up.component.html',
  styleUrls: ['./edit-students-pop-up.component.scss']
})
export class EditStudentsPopUpComponent {
  student: Student;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.student = data.student;
  }
}

