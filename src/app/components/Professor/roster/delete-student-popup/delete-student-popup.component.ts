import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { StudentCourseGraderInfo } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-delete-student-popup',
  templateUrl: './delete-student-popup.component.html',
  styleUrls: ['./delete-student-popup.component.scss'],
})
export class DeleteStudentPopupComponent {
  student: StudentCourseGraderInfo;
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { student: StudentCourseGraderInfo },
    private professorService: ProfessorService,
    private dialogRef: MatDialogRef<DeleteStudentPopupComponent>
  ) {
    this.student = data.student;
  }

  async onDeleteStudent() {
    try {
      const { student_id, course_id } = this.student;
      await this.professorService.deleteStudentFromCourse(
        student_id,
        course_id
      );
      this.dialogRef.close(true);
    } catch (err) {
      console.log(err);
      throw new Error('deleteStudent');
    }
  }
}
