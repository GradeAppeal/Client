import { Component, Inject, Optional, Input } from '@angular/core';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Assignment } from '../../../../shared/interfaces/psql.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfessorTemplate } from 'src/app/shared/interfaces/professor.interface';
import { ProfessorService } from 'src/app/services/professor.service';

@Component({
  selector: 'app-delete-template',
  templateUrl: './delete-template.component.html',
  styleUrls: ['./delete-template.component.scss'],
})
export class DeleteTemplateComponent {
  templateID: number;
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private route: ActivatedRoute,
    private dialogRef: MatDialogRef<DeleteTemplateComponent>,
    private professorService: ProfessorService
  ) {
    this.templateID = data.templateID;
    console.log(this.templateID);
  }

  async onDeleteTemplate(): Promise<void> {
    /*  delete template from database */
    try {
      console.log(this.templateID);
      await this.professorService.deleteTemplate(this.templateID);
    } catch (err) {
      console.log(err);
      throw new Error('onDeleteTemplate');
    }
    /*   close pop-up */
    this.dialogRef.close();
  }
}
