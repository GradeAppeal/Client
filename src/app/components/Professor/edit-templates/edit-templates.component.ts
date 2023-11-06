import {
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { ProfessorTemplate } from 'src/app/shared/interfaces/professor.interface';
import { ProfessorService } from 'src/app/services/professor.service';
import { MatDialog } from '@angular/material/dialog';
import { AddTemplateComponent } from './add-template/add-template.component';
import { DeleteTemplateComponent } from './delete-template/delete-template.component';
import { PROFESSOR_UUID } from 'src/app/shared/strings';

@Component({
  selector: 'app-edit-templates',
  templateUrl: './edit-templates.component.html',
  styleUrls: ['./edit-templates.component.scss'],
})
export class EditTemplatesComponent {
  constructor(
    private professorService: ProfessorService,
    private dialog: MatDialog
  ) {}
  professorTemplates: ProfessorTemplate[];
  professorID = 1; //TODO make this actual user ID not just fake data
  editTemplate(template: ProfessorTemplate) {}

  async ngOnInit() {
    this.professorTemplates =
      await this.professorService.fetchProfessorTemplates(PROFESSOR_UUID);
  }

  /**
   * Goes to AddTemplate pop up component
   */
  async addTemplatePopUp(professorID: number): Promise<void> {
    const dialogRef = this.dialog.open(AddTemplateComponent, {
      width: '80%',
      height: '80%',
      data: { professorID: professorID },
    });
  }

  /**
   * Goes to DeleteTemplate pop up component
   */
  async deleteTemplatePopUp(templateID: number): Promise<void> {
    const dialogRef = this.dialog.open(DeleteTemplateComponent, {
      width: '50%',
      height: '55%',
      data: { templateID: templateID },
    });
  }
}
