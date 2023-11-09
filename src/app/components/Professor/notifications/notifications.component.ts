import { Component } from '@angular/core';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { Router } from '@angular/router';
import { ProfessorService } from 'src/app/services/professor.service';
import { formatTimestamp } from 'src/app/shared/functions/general.util';
import { PROFESSOR_UUID } from 'src/app/shared/strings';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent {
  professorAppeals!: ProfessorAppeal[];
  professorCourses!: Course[];
  fetchedAppeals = false;
  toDoAppeals: ProfessorAppeal[] = [];

  constructor(
    private router: Router,
    private professorService: ProfessorService
  ) {}
  async ngOnInit(): Promise<void> {
    try {
      this.professorAppeals =
        await this.professorService.fetchOpenProfessorAppeals(PROFESSOR_UUID);
      this.professorCourses = await this.professorService.fetchProfessorCourses(
        PROFESSOR_UUID
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
