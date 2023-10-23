import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
<<<<<<< HEAD:src/app/edit-students-pop-up/edit-students-pop-up.component.ts
import { Student } from '../shared/interfaces/psql.interface';
=======
import { Student } from '../../Professor/profile/profile.component';
>>>>>>> 47fcde1ed4ed59c5dcc99da8257a7a20ae5b3859:src/app/components/Student/edit-students-pop-up/edit-students-pop-up.component.ts

@Component({
  selector: 'app-edit-students-pop-up',
  templateUrl: './edit-students-pop-up.component.html',
  styleUrls: ['./edit-students-pop-up.component.scss'],
})
export class EditStudentsPopUpComponent {
  student: Student;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.student = data.student;
  }
}
