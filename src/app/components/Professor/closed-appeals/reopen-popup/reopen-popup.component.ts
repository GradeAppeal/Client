import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-reopen-popup',
  templateUrl: './reopen-popup.component.html',
  styleUrls: ['./reopen-popup.component.scss'],
})
export class ReopenPopupComponent {
  appeal: ProfessorAppeal;
  closeAppealMessage: string;
  studentName: string;
  course: string;
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { reopenAppeal: ProfessorAppeal },
    public dialogRef: MatDialogRef<ReopenPopupComponent>,
    private professorService: ProfessorService
  ) {
    this.appeal = data.reopenAppeal;
  }
  async onReopenAppeal() {
    try {
      console.log(this.appeal.appeal_id);
      const reopenedAppealID =
        await this.professorService.updateAppealOpenStatus(
          this.appeal.appeal_id
        );
      this.dialogRef.close(reopenedAppealID);
    } catch (err) {
      console.log({ err });
      throw new Error('onReopenAppeal');
    }
  }
}
