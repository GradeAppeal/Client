import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { formatTimestamp } from 'src/app/shared/functions/general.util';
import { Session } from '@supabase/supabase-js';
@Component({
  selector: 'app-professor-appeal-inbox',
  templateUrl: './professor-appeal-inbox.component.html',
  styleUrls: ['./professor-appeal-inbox.component.scss'],
})
export class ProfessorAppealInboxComponent {
  @Output() isChat = new EventEmitter<{ professorAppeal: ProfessorAppeal }>();
  //inboxAppeals: AppealInbox[];
  session: Session;
  noAppeals: boolean;
  appeals: any[];
  appeal: any;
  email = 'abc123@gmail.com';
  showChat: boolean = false;
  date = new Date();

  professorAppeals!: ProfessorAppeal[];
  professorCourses!: Course[];
  currentAppeal: ProfessorAppeal;
  fetchedAppeals = false;
  user: any;

  constructor(
    private router: Router,
    private authService: SupabaseService,
    private professorService: ProfessorService
  ) {}
  async ngOnInit(): Promise<void> {
    try {
      const user = await this.authService.getUser();
      this.professorAppeals = await this.professorService.fetchProfessorAppeals(
        user.id
      );
      this.noAppeals = this.professorAppeals.length === 0 ? true : false;
      console.log(this.professorAppeals, 'appeals');
      this.professorCourses = await this.professorService.fetchProfessorCourses(
        user.id
      );
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

  compareDate() {}
  composeMessage() {}
  chat(appeal: ProfessorAppeal) {
    this.isChat.emit({ professorAppeal: appeal });
  }
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
