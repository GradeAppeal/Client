import { ProfessorTemplate } from 'src/app/shared/interfaces/professor.interface';
import { Component, Inject, Optional, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Course } from '../../../../shared/interfaces/psql.interface';
import { ProfessorService } from 'src/app/services/professor.service';

@Component({
  selector: 'app-add-template',
  templateUrl: './add-template.component.html',
  styleUrls: ['./add-template.component.scss'],
})
export class AddTemplateComponent {
  templates: ProfessorTemplate;
  professorID: number;
  newTemplateName: string;
  newTemplateText: string;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private route: ActivatedRoute,
    private dialogRef: MatDialogRef<AddTemplateComponent>,
    private professorService: ProfessorService
  ) {
    this.professorID = data.professorID;
  }

  /*
   * Add template to database
   */
  async onAddTemplate() {
    /*  add template to database */
    try {
      await this.professorService.insertTemplate(
        this.professorID,
        this.newTemplateName,
        this.newTemplateText
      );
    } catch (err) {
      console.log(err);
      throw new Error('insertTemplate');
    }
    /*   close pop-up */
    this.dialogRef.close();
  }
}
