import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-delete-appeal-popup',
  templateUrl: './delete-appeal-popup.component.html',
  styleUrls: ['./delete-appeal-popup.component.scss'],
})
export class DeleteAppealPopupComponent {
  appeal: ProfessorAppeal;
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { appealToDelete: ProfessorAppeal },
    public dialogRef: MatDialogRef<DeleteAppealPopupComponent>,
    private professorService: ProfessorService
  ) {
    this.appeal = data.appealToDelete;
  }

  async onDeleteAppeal() {
    try {
      await this.professorService.deleteAppeal(this.appeal.appeal_id);
    } catch (err) {
      console.log({ err });
    }
  }
}
