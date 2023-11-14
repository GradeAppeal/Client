import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { StudentCourseGraderInfo } from 'src/app/shared/interfaces/professor.interface';

interface ParentData {
  graders: StudentCourseGraderInfo[];
  appealID: number;
}

@Component({
  selector: 'app-assign-grader-popup',
  templateUrl: './assign-grader-popup.component.html',
  styleUrls: ['./assign-grader-popup.component.scss'],
})
export class AssignGraderPopupComponent {
  graders: StudentCourseGraderInfo[];
  appealID: number;
  selectedGrader: StudentCourseGraderInfo;
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: ParentData,
    public dialogRef: MatDialogRef<AssignGraderPopupComponent>,
    private professorService: ProfessorService
  ) {
    this.graders = data.graders;
    this.appealID = data.appealID;
  }

  onSelectGrader(grader: StudentCourseGraderInfo) {
    this.selectedGrader = grader;
  }

  async onAssignGrader() {
    const assignedGraderID = await this.professorService.updateAppealGrader(
      this.appealID,
      this.selectedGrader.student_id
    );
    this.dialogRef.close(assignedGraderID);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
