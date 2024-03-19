import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { StudentCourseGraderInfo } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-edit-grader',
  templateUrl: './edit-grader.component.html',
  styleUrls: ['./edit-grader.component.scss'],
})
export class EditGraderComponent {
  cid: number;
  aid: number;
  graders: StudentCourseGraderInfo[];
  assignedGrader: StudentCourseGraderInfo;
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditGraderComponent>,
    private professorService: ProfessorService
  ) {
    const { assignedGrader, graders, cid, aid } = data;
    this.graders = graders;
    this.cid = cid;
    this.aid = aid;
    this.assignedGrader = assignedGrader;
  }

  async onEditGrader() {
    const { student_id, student_name } = this.assignedGrader;
    await this.professorService.updateAssignmentGrader(
      this.aid,
      student_id,
      student_name
    );
    this.dialogRef.close(true);
  }
}
