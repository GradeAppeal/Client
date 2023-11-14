import { Component } from '@angular/core';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Course, Professor } from 'src/app/shared/interfaces/psql.interface';
import { ProfessorService } from 'src/app/services/professor.service';
import { formatTimestamp } from 'src/app/shared/functions/general.util';
import { SupabaseService } from 'src/app/services/auth.service';
import { Session } from '@supabase/supabase-js';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent {
  session: Session;
  professor: Professor;
  professorAppeals!: ProfessorAppeal[];
  professorCourses!: Course[];
  fetchedAppeals = false;
  toDoAppeals: ProfessorAppeal[] = [];

  constructor(
    private authService: SupabaseService,
    private professorService: ProfessorService
  ) {}
  async ngOnInit(): Promise<void> {
    this.session = (await this.authService.getSession()) as Session;
    const { user } = this.session;

    this.professor = {
      id: user.id,
      first_name: user.user_metadata['first_name'],
      last_name: user.user_metadata['last_name'],
      email: user.user_metadata['email'],
    };
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
