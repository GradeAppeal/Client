import { Component, Inject, Optional } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { passwordMatchValidator } from 'src/app/shared/functions/form.validator.util';
import { StudentCourseGraderInfo } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-reset-student-password-popup',
  templateUrl: './reset-student-password-popup.component.html',
  styleUrls: ['./reset-student-password-popup.component.scss'],
})
export class ResetStudentPasswordPopupComponent {
  student: StudentCourseGraderInfo;
  passwordForm: FormGroup;
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { student: StudentCourseGraderInfo },
    private professorService: ProfessorService,
    private dialogRef: MatDialogRef<ResetStudentPasswordPopupComponent>
  ) {
    this.student = data.student;
  }

  async ngOnInit() {
    // initialize password form
    this.passwordForm = new FormGroup(
      {
        newPassword: new FormControl<string>('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl<string>('', [Validators.required]),
      },
      { validators: passwordMatchValidator }
    );
  }

  async onResetStudentPassword() {
    try {
      const { newPassword } = this.passwordForm.value;
      await this.professorService.updateStudentPassword(
        this.student.student_id,
        newPassword
      );
      this.dialogRef.close('success');
    } catch (err) {
      console.log({ err });
      this.dialogRef.close('error');
    }
  }
}
