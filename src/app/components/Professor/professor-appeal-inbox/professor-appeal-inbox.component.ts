import { HttpParams } from '@angular/common/http';
import { ViewEncapsulation } from '@angular/compiler';
import { Component, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { formatTimestamp } from 'src/app/shared/functions/general.util';
import { navigate } from 'src/app/shared/functions/general.util';
@Component({
  selector: 'app-professor-appeal-inbox',
  templateUrl: './professor-appeal-inbox.component.html',
  styleUrls: ['./professor-appeal-inbox.component.scss'],
})
export class ProfessorAppealInboxComponent {
  @Output() isChat = new EventEmitter<{ professorAppeal: ProfessorAppeal }>();
  //inboxAppeals: AppealInbox[];
  appeals: any[];
  appeal: any;
  email = 'abc123@gmail.com';
  showChat: boolean = false;
  date = new Date();

  professorAppeals!: ProfessorAppeal[];
  professorCourses!: Course[];
  currentAppeal: ProfessorAppeal;
  fetchedAppeals = false;

  constructor(private router: Router, private supabase: SupabaseService) {}
  async ngOnInit(): Promise<void> {
    try {
      this.professorAppeals = await this.supabase.fetchProfessorAppeals(1); //todo fix id
      this.professorCourses = await this.supabase.fetchProfessorCourses(1);
      this.currentAppeal = this.professorAppeals[0];
      this.fetchedAppeals = true;
    } catch (err) {
      console.log(err);
    }
  }
  selectAppeal(appeal: any) {
    this.currentAppeal = appeal;
  }
  localFormatTimestamp(timestamp: Date): { date: string; time: string } {
    return formatTimestamp(timestamp);
  }

  navigateTo(route: string) {
    navigate(this.router, route); //use the navigate function from general.utils
  }
}
