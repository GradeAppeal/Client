import { ProfessorTemplate } from 'src/app/shared/interfaces/professor.interface';
import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorService } from 'src/app/services/professor.service';

@Component({
  selector: 'app-add-template',
  templateUrl: './add-template.component.html',
  styleUrls: ['./add-template.component.scss'],
})
export class AddTemplateComponent {
  templates: ProfessorTemplate;
  professorID: string;
  newTemplateName: string;
  newTemplateText: string;
  professorTemplates: ProfessorTemplate[];
  errorMessage: string;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddTemplateComponent>,
    private professorService: ProfessorService
  ) {
    this.professorID = data.professorID;
  }
  async ngOnInit() {
    this.professorTemplates =
      await this.professorService.fetchProfessorTemplates(this.professorID);
  }

  /*
   * Add template to database
   */
  async onAddTemplate() {
    /*  add template to database */
    try {
      if (this.checkTemplates(this.newTemplateName, this.professorTemplates)) {
        console.log('You gotta change this name');
        this.errorMessage =
          'Already have template with that name. Please change name.';
      } else {
        await this.professorService.insertTemplate(
          this.professorID,
          this.newTemplateName,
          this.newTemplateText
        );
        /*   close pop-up */
        this.dialogRef.close();
      }
    } catch (err) {
      console.log(err);
      throw new Error('insertTemplate');
    }
  }

  checkTemplates(templateName: string, templateList: ProfessorTemplate[]) {
    return templateList.some((template) => template.temp_name === templateName);
  }
}
