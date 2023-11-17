import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { StudentCourseGraderInfo } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-edit-students-pop-up',
  templateUrl: './edit-students-pop-up.component.html',
  styleUrls: ['./edit-students-pop-up.component.scss'],
})
export class EditStudentsPopUpComponent {
  student: StudentCourseGraderInfo;
  color = 'primary';
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { studentCourseGrader: StudentCourseGraderInfo },
    private dialogRef: MatDialogRef<EditStudentsPopUpComponent>,
    private professorService: ProfessorService
  ) {
    this.student = data.studentCourseGrader;
  }

  async onAssignGrader(): Promise<void> {
    try {
      const { student_id, course_id } = this.student;
      console.log(student_id, course_id);
      await this.professorService.updateGrader(student_id, course_id);
    } catch (err) {
      throw new Error('makeGrader');
    }
    this.dialogRef.close();
  }

  async onRemoveStudent(): Promise<void> {
    try {
      const { student_id, course_id } = this.student;
      const deletedStudent =
        await this.professorService.deleteStudentFromCourse(
          student_id,
          course_id
        );
      console.log('Deleted Student: ', { deletedStudent });
      /*   close pop-up */
    } catch (error) {
      console.log({ error });
    }
    this.dialogRef.close();
  }
}
