import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { SharedService } from 'src/app/services/shared.service';
import { StudentCourseGraderInfo } from 'src/app/shared/interfaces/professor.interface';
import { Professor } from 'src/app/shared/interfaces/psql.interface';
import { getTimestampTz } from 'src/app/shared/functions/time.util';

interface ParentData {
  graders: StudentCourseGraderInfo[];
  appealID: number;
  professor: Professor;
}

@Component({
  selector: 'app-assign-grader-popup',
  templateUrl: './assign-grader-popup.component.html',
  styleUrls: ['./assign-grader-popup.component.scss'],
})
export class AssignGraderPopupComponent {
  graders: StudentCourseGraderInfo[];
  appealID: number;
  professor: Professor;
  selectedGrader: StudentCourseGraderInfo;
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: ParentData,
    public dialogRef: MatDialogRef<AssignGraderPopupComponent>,
    private professorService: ProfessorService,
    private sharedService: SharedService
  ) {
    this.graders = data.graders;
    this.appealID = data.appealID;
    this.professor = data.professor;
  }

  onSelectGrader(grader: StudentCourseGraderInfo) {
    this.selectedGrader = grader;
  }

  async onAssignGrader() {
    const assignedGraderID = await this.professorService.updateAppealGrader(
      this.appealID,
      this.selectedGrader.student_id
    );
    const now = getTimestampTz(new Date());
    await this.sharedService.insertMessage(
      this.appealID,
      this.professor.id,
      assignedGraderID,
      now,
      'Notification: Sent to grader',
      false,
      `${this.professor.first_name} ${this.professor.last_name}`,
      this.selectedGrader.student_name
    );
    this.dialogRef.close(assignedGraderID);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
