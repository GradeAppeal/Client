import { Component } from '@angular/core';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';
import { formatTimestamp } from 'src/app/shared/functions/general.util';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {

  date = new Date();
  professorAppeals!: ProfessorAppeal[];
  professorCourses!: Course[];
  fetchedAppeals = false;
  newAppeals: ProfessorAppeal[] = [];
  appealComplete = false;


  constructor(private router: Router, private supabase: SupabaseService) {}
  async ngOnInit(): Promise<void> {
    try {
      this.professorAppeals = await this.supabase.fetchProfessorAppeals(1);
      this.professorCourses = await this.supabase.fetchProfessorCourses(1);
      this.fetchedAppeals = true;
    } catch (err) {
      console.log(err);
    }
    this.date.setDate(this.date.getDate() - 35);
    this.professorAppeals.forEach(appeal => {
      if((new Date(appeal.created_at) > this.date) && (appeal.is_open)) {
        this.newAppeals.push(appeal);
      }
    });
  }

  localFormatTimestamp(timestamp: Date): { date: string; time: string } {
    return formatTimestamp(timestamp);
  }
}
