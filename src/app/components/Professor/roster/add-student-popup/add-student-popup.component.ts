
import { MatSelect } from '@angular/material/select';
import { Component, Inject, Optional, Input, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ParsedStudent } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-add-student-popup',
  templateUrl: './add-student-popup.component.html',
  styleUrls: ['./add-student-popup.component.scss']
})
export class AddStudentPopupComponent {
  student: ParsedStudent = {
    first_name:  "",
    last_name: "",
    email: "",
  };

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private route: ActivatedRoute,
    private dialogRef: MatDialogRef<AddStudentPopupComponent>,
  ) {
  }
  
  onSubmit() {
    this.dialogRef.close({student: this.student })
  }
}
