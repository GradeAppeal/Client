import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorTemplate } from 'src/app/shared/interfaces/professor.interface';
import { AddTemplateComponent } from '../add-template/add-template.component';
import { ProfessorService } from 'src/app/services/professor.service';

@Component({
  selector: 'app-update-template',
  templateUrl: './update-template.component.html',
  styleUrls: ['./update-template.component.scss'],
})
export class UpdateTemplateComponent {
  templates: ProfessorTemplate;
  templateID: number;
  professorID: string;
  oldName: string;
  oldText: string;
  updatedTemplateName: string;
  updatedTemplateText: string;
  professorTemplates: ProfessorTemplate[];
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddTemplateComponent>,
    private professorService: ProfessorService
  ) {
    this.templateID = data.templateID;
    this.professorID = data.professorID;
    this.oldName = data.templateName;
    this.oldText = data.templateText;
    console.log(this.oldName, this.oldText);
  }
  async ngOnInit() {
    this.professorTemplates =
      await this.professorService.fetchProfessorTemplates(this.professorID);
    this.updatedTemplateName = this.oldName;
    this.updatedTemplateText = this.oldText;
  }

  /*
   * Add template to database
   */
  async onUpdateTemplate() {
    /*  add template to database */
    try {
      await this.professorService.updateTemplate(
        this.templateID,
        this.professorID,
        this.updatedTemplateName,
        this.updatedTemplateText
      );
    } catch (err) {
      console.log(err);
      throw new Error('updateTemplate');
    }
    /*   close pop-up */
    this.dialogRef.close();
  }
}
