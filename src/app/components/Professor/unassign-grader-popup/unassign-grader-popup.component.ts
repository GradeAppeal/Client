import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { SharedService } from 'src/app/services/shared.service';
import { StudentCourseGraderInfo } from 'src/app/shared/interfaces/professor.interface';
import { Professor } from 'src/app/shared/interfaces/psql.interface';
import { getTimestampTz } from 'src/app/shared/functions/time.util';

interface ParentData {
  graderName: string;
  appealID: number;
  studentID: string;
  professorID: string;
}

@Component({
  selector: 'app-unassign-grader-popup',
  templateUrl: './unassign-grader-popup.component.html',
  styleUrls: ['./unassign-grader-popup.component.scss'],
})
export class UnassignGraderPopupComponent {
  graderName: string;
  appealID: number;
  studentID: string;
  professorID: string;
  message: string;
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: ParentData,
    public dialogRef: MatDialogRef<UnassignGraderPopupComponent>,
    private professorService: ProfessorService,
    private sharedService: SharedService
  ) {
    this.graderName = data.graderName;
    this.appealID = data.appealID;
    this.studentID = data.studentID;
    this.professorID = data.professorID;
  }

  async unassignGrader() {
    await this.professorService.updateUnassignAppealGrader(this.appealID);
    const now = getTimestampTz(new Date());
    this.message = 'Notification: Grader Unassigned';

    await this.sharedService.insertMessage(
      this.appealID,
      this.professorID,
      this.studentID,
      now,
      this.message,
      false,
      '',
      '',
      false
    );
    this.dialogRef.close();
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
