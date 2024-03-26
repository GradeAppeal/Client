import { Component, Inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-close-appeal-popup',
  templateUrl: './close-appeal-popup.component.html',
  styleUrls: ['./close-appeal-popup.component.scss'],
})
export class CloseAppealPopupComponent {
  appeal: ProfessorAppeal;
  closeAppealMessage: string;
  studentName: string;
  course: string;
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { currentAppeal: ProfessorAppeal },
    public dialogRef: MatDialogRef<CloseAppealPopupComponent>,
    private professorService: ProfessorService,
    private router: Router
  ) {
    this.appeal = data.currentAppeal;
  }

  async onCloseAppeal(): Promise<void> {
    try {
      const now = new Date();
      console.log(this.appeal.appeal_id);
      const closedAppealID = await this.professorService.updateAppealOpenStatus(
        this.appeal.appeal_id
      );
      this.dialogRef.close(closedAppealID);
      this.router.navigateByUrl('professor/appeal-inbox');
    } catch (err) {
      console.log({ err });
      throw new Error('onCloseAppeal');
    }
  }
}
