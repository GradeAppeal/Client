import { Component } from '@angular/core';
import { ProfessorTemplate } from 'src/app/shared/interfaces/professor.interface';
import { ProfessorService } from 'src/app/services/professor.service';
import { MatDialog } from '@angular/material/dialog';
import { AddTemplateComponent } from './add-template/add-template.component';
import { DeleteTemplateComponent } from './delete-template/delete-template.component';
import { AuthService } from 'src/app/services/auth.service';
import { Session, User } from '@supabase/supabase-js';
import { SharedService } from 'src/app/services/shared.service';
import { Professor } from 'src/app/shared/interfaces/psql.interface';

@Component({
  selector: 'app-edit-templates',
  templateUrl: './edit-templates.component.html',
  styleUrls: ['./edit-templates.component.scss'],
})
export class EditTemplatesComponent {
  constructor(
    private sharedService: SharedService,
    private authService: AuthService,
    private professorService: ProfessorService,
    private dialog: MatDialog
  ) {}
  session: Session;
  user: User;
  professor: Professor;
  professorTemplates: ProfessorTemplate[];

  async ngOnInit() {
    this.session = (await this.authService.getSession()) as Session;
    this.user = this.session.user;
    this.professor = {
      id: this.user.id,
      first_name: this.user.user_metadata['first_name'],
      last_name: this.user.user_metadata['last_name'],
      email: this.user.user_metadata['email'],
    };
    this.professorTemplates =
      await this.professorService.fetchProfessorTemplates(this.professor.id);
    this.handleTemplateUpdates();
  }

  handleTemplateUpdates() {
    this.sharedService
      .getTableChanges(
        'Templates',
        `template-channel`,
        `professor_id=eq.${this.professor.id}`
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
        }
        // template deleted
        else if (event === 'DELETE') {
          this.professorTemplates = this.professorTemplates.filter(
            (template) => template.id !== record.id
          );
        }
      });
  }

  /**
   * Goes to AddTemplate pop up component
   */
  async addTemplatePopUp(): Promise<void> {
    const dialogRef = this.dialog.open(AddTemplateComponent, {
      width: '80%',
      height: '80%',
      data: { professorID: this.user.id },
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
