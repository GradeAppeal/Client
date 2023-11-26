import { Component } from '@angular/core';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Course, Professor } from 'src/app/shared/interfaces/psql.interface';
import { ProfessorService } from 'src/app/services/professor.service';
import { formatTimestamp } from 'src/app/shared/functions/general.util';
import { AuthService } from 'src/app/services/auth.service';
import { User } from '@supabase/supabase-js';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent {
  user: User;
  professor: Professor;
  professorAppeals!: ProfessorAppeal[];
  professorCourses!: Course[];
  fetchedAppeals = false;
  toDoAppeals: ProfessorAppeal[] = [];

  constructor(
    private authService: AuthService,
    private professorService: ProfessorService
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
  async ngOnInit(): Promise<void> {
    try {
      this.professorAppeals =
        await this.professorService.fetchOpenProfessorAppeals(
          this.professor.id
        );
      this.professorCourses = await this.professorService.fetchProfessorCourses(
        this.professor.id
      );
      this.fetchedAppeals = true;
    } catch (err) {
      console.log(err);
    }
    this.professorAppeals.forEach((appeal) => {
      if (appeal.is_open && appeal.grader_id == null) {
        this.toDoAppeals.push(appeal);
      }
    });
    console.log(this.toDoAppeals.length);
  }

  localFormatTimestamp(timestamp: Date): { date: string; time: string } {
    return formatTimestamp(timestamp);
  }
}
