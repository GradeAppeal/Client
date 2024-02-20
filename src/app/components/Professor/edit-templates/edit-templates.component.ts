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
import { UpdateTemplateComponent } from './update-template/update-template.component';

@Component({
  selector: 'app-edit-templates',
  templateUrl: './edit-templates.component.html',
  styleUrls: ['./edit-templates.component.scss'],
})
export class EditTemplatesComponent {
  session: Session;
  user: User;
  professor: Professor;
  professorTemplates: ProfessorTemplate[];
  noTemplates: boolean;

  constructor(
    private sharedService: SharedService,
    private authService: AuthService,
    private professorService: ProfessorService,
    private dialog: MatDialog
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
        this.professor = {
          id: this.user.id,
          first_name: this.user.user_metadata['first_name'],
          last_name: this.user.user_metadata['last_name'],
          email: this.user.email as string,
        };
      }
    });
  }

  async ngOnInit() {
    try {
      this.professorTemplates =
        await this.professorService.fetchProfessorTemplates(this.professor.id);
      this.noTemplates = this.professorTemplates.length === 0 ? true : false;
      this.handleTemplateUpdates();
    } catch (err) {
      console.log(err);
    }
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
        if (event === 'INSERT' || event === 'UPDATE') {
          const newTemplate = { ...record };
          //check if template exists in list
          const templateIndex = this.professorTemplates.findIndex(
            (template) => template.id === newTemplate.id
          );
          if (templateIndex !== -1) {
            // if it exists, update it. Otherwise, add to list
            this.professorTemplates[templateIndex] = newTemplate;
          } else {
            this.professorTemplates.push(newTemplate);
          }
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
      height: '100%',
      data: { professorID: this.user.id },
    });
  }

  /**
   * Goes to DeleteTemplate pop up component
   */
  async deleteTemplatePopUp(templateID: number): Promise<void> {
    const dialogRef = this.dialog.open(DeleteTemplateComponent, {
      data: { templateID: templateID },
    });
  }
  /**
   * Goes to DeleteTemplate pop up component
   */
  async updateTemplatePopUp(
    templateID: number,
    templateName: string,
    templateText: string
  ): Promise<void> {
    const dialogRef = this.dialog.open(UpdateTemplateComponent, {
      data: {
        templateID: templateID,
        professorID: this.user.id,
        templateName: templateName,
        templateText: templateText,
      },
    });
  }
}
