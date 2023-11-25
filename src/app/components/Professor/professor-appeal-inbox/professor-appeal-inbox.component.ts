import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Course, Professor } from 'src/app/shared/interfaces/psql.interface';
import { formatTimestamp } from 'src/app/shared/functions/general.util';
import { Session, User } from '@supabase/supabase-js';
import { CloseAppealPopupComponent } from './close-appeal-popup/close-appeal-popup.component';
import { AssignGraderPopupComponent } from '../professor-interaction-history/assign-grader-popup/assign-grader-popup.component';
import { GraderAssignedSnackbarComponent } from '../professor-interaction-history/grader-assigned-snackbar/grader-assigned-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-professor-appeal-inbox',
  templateUrl: './professor-appeal-inbox.component.html',
  styleUrls: ['./professor-appeal-inbox.component.scss'],
})
export class ProfessorAppealInboxComponent implements OnInit {
  @Output() isChat = new EventEmitter<{ professorAppeal: ProfessorAppeal }>();
  session: Session;
  user: User;
  professor: Professor;
  noAppeals = true;
  appeals: any[];
  appeal: any;
  email = 'abc123@gmail.com';
  showChat: boolean = false;
  date = new Date();

  professorAppeals!: ProfessorAppeal[];
  professorCourses!: Course[];
  currentAppeal: ProfessorAppeal;
  fetchedAppeals = false;
  durationInSeconds: number = 2;
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private professorService: ProfessorService,
    private _snackBar: MatSnackBar
  ) {}
  async ngOnInit(): Promise<void> {
    try {
      this.session = (await this.authService.getSession()) as Session;
      this.user = this.session.user;
      this.professor = {
        id: this.user.id,
        first_name: this.user.user_metadata['first_name'],
        last_name: this.user.user_metadata['last_name'],
        email: this.user.email as string,
      };

      this.professorAppeals =
        await this.professorService.fetchOpenProfessorAppeals(this.user.id);

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
    console.log(this.currentAppeal);
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

  async onCloseAppeal(event: MouseEvent) {
    const currentAppeal = this.currentAppeal;
    const dialogRef = this.dialog.open(CloseAppealPopupComponent, {
      width: '30%',
      height: '25%',
      data: { currentAppeal },
    });

    // update UI: get rid of closed appeal
    dialogRef.afterClosed().subscribe((result: number) => {
      this.professorAppeals = this.professorAppeals.filter(
        (appeal) => appeal.appeal_id !== result
      );
      this.currentAppeal = this.professorAppeals[0];
    });
  }

  async onAssignGrader(event: MouseEvent) {
    const currentAppeal = this.currentAppeal;
    if (!this.currentAppeal.grader_id) {
      const graders = await this.professorService.getGraders(
        this.currentAppeal.course_id
      );

      const appealID = currentAppeal.appeal_id;
      // open popup to assign grader
      const dialog = this.dialog.open(AssignGraderPopupComponent, {
        width: '30%',
        height: '35%',
        data: { graders, appealID, professor: this.professor },
      });
    } else {
      console.log('appeal already assigned to grader');
      this._snackBar.openFromComponent(GraderAssignedSnackbarComponent, {
        duration: this.durationInSeconds * 1000,
      });
    }
  }
}
