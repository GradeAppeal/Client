import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProfessorTemplate } from 'src/app/shared/interfaces/professor.interface';
import { AddTemplateComponent } from '../add-template/add-template.component';
import { ProfessorService } from 'src/app/services/professor.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-update-template',
  templateUrl: './update-template.component.html',
  styleUrls: ['./update-template.component.scss'],
})
export class UpdateTemplateComponent {
  templates: ProfessorTemplate;
  professorID: string;
  oldName: string;
  oldText: string;
  updatedTemplateName: string;
  updatedTemplateText: string;
  professorTemplates: ProfessorTemplate[];
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddTemplateComponent>,
    private professorService: ProfessorService,
    private sharedService: SharedService
  ) {
    this.professorID = data.professorID;
    this.oldName = data.templateName;
    this.oldText = data.templateText;
    console.log(this.oldName, this.oldText);
  }
  async ngOnInit() {
    this.professorTemplates =
      await this.professorService.fetchProfessorTemplates(this.professorID);
    this.handleTemplateUpdates();
    this.updatedTemplateName = this.oldName;
    this.updatedTemplateText = this.oldText;
  }

  handleTemplateUpdates() {
    this.sharedService
      .getTableChanges(
        'Templates',
        `template-channel`,
        `professor_id=eq.${this.professorID}`
      )
      .subscribe(async (update) => {
        // if insert or update event, get new row
        // if delete event, get deleted row ID
        const record = update.new?.id ? update.new : update.old;
        // INSERT or DELETE
        const event = update.eventType;
        if (!record) return;
        // new template inserted
        if (event === 'INSERT') {
          const newTemplate = { ...record };
          this.professorTemplates.push(newTemplate);
        } else if (event === 'UPDATE') {
          const newTemplate = { ...record };
          this.professorTemplates.push(newTemplate);
        }
        // template deleted
        else if (event === 'DELETE') {
          this.professorTemplates = this.professorTemplates.filter(
            (template) => template.id !== record.id
          );
        }
      });
  }
  /*
   * Add template to database
   */
  async onUpdateTemplate() {
    /*  add template to database */
    try {
      await this.professorService.updateTemplate(
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
