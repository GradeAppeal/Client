import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Course } from 'src/app/shared/interfaces/psql.interface';
import { formatTimestamp } from 'src/app/shared/functions/general.util';
import { Session, User } from '@supabase/supabase-js';
import { SignoutComponent } from '../../Auth/signout/signout.component';
import { MatDialog } from '@angular/material/dialog';
import { CloseAppealPopupComponent } from '../close-appeal-popup/close-appeal-popup.component';
@Component({
  selector: 'app-professor-appeal-inbox',
  templateUrl: './professor-appeal-inbox.component.html',
  styleUrls: ['./professor-appeal-inbox.component.scss'],
})
export class ProfessorAppealInboxComponent {
  @Output() isChat = new EventEmitter<{ professorAppeal: ProfessorAppeal }>();
  //inboxAppeals: AppealInbox[];
  session: Session;
  user: User;
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

  constructor(
    private router: Router,
    private authService: SupabaseService,
    private professorService: ProfessorService,
    private dialog: MatDialog
  ) {}
  async ngOnInit(): Promise<void> {
    try {
      this.session = (await this.authService.getSession()) as Session;
      this.user = this.session.user;
      this.professorAppeals = await this.professorService.fetchProfessorAppeals(
        this.user.id
      );
      this.noAppeals = this.professorAppeals.length === 0 ? true : false;
      console.log(this.professorAppeals, 'appeals');
      this.professorCourses = await this.professorService.fetchProfessorCourses(
        this.user.id
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

  closeAppeal() {
    this.dialog.open(CloseAppealPopupComponent, {
      width: '30%',
      height: '25%',
    });
    //this.navigateTo('professor/closed-appeals/');
  }
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
