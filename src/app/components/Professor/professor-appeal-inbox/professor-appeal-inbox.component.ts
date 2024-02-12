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
import { SharedService } from 'src/app/services/shared.service';
import { UnassignGraderPopupComponent } from '../unassign-grader-popup/unassign-grader-popup.component';

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
  filteredAppeals: ProfessorAppeal[];
  professorCourses!: Course[];
  currentAppeal: ProfessorAppeal;
  fetchedAppeals = false;
  durationInSeconds: number = 2;
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private sharedService: SharedService,
    private professorService: ProfessorService,
    private _snackBar: MatSnackBar
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
      this.filteredAppeals = this.professorAppeals;

      this.noAppeals = this.professorAppeals.length === 0 ? true : false;
      console.log(this.professorAppeals, 'appeals');
      this.professorCourses = await this.professorService.fetchProfessorCourses(
        this.professor.id
      );
      this.currentAppeal = this.professorAppeals[0];
      this.fetchedAppeals = true;

      this.handleAppealUpdates();
    } catch (err) {
      console.log({ err });
    }
  }

  handleAppealUpdates(): void {
    this.sharedService
      .getTableChanges(
        'Appeals',
        'appeals-update-channel',
        `professor_id=eq.${this.professor.id}`
      )
      .subscribe(async (update: any) => {
        console.log({ update });
        // get the newly updated row
        const record = update.new?.id ? update.new : update.old;
        const event = update.eventType;
        if (!record) return;
        // insert new appeals by student
        if (event === 'INSERT') {
          const newAppeal = await this.professorService.getNewProfessorAppeal(
            record.id
          );
          this.professorAppeals = newAppeal.concat(this.professorAppeals);
        }
        // update grader status
        else if (event === 'UPDATE') {
          this.currentAppeal.grader_id = record.grader_id;
        }
        // safety delete check in case closed appeal not removed from appeal inbox
        else if (event === 'DELETE') {
          console.log('delete', { record });
          this.professorAppeals = this.professorAppeals.filter(
            (appeal) => appeal !== record.id
          );
        }
      });
  }

  selectAppeal(appeal: any) {
    this.currentAppeal = appeal;
    console.log(this.currentAppeal);
    //this.handleGraderUpdates();
  }

  formatTimestamp(timestamp: Date): { date: string; time: string } {
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
  filterResults(text: string) {
    if (!text) {
      this.filteredAppeals = this.professorAppeals;
      return;
    }

    this.filteredAppeals = this.professorAppeals.filter((appeal) => {
      return (
        appeal?.assignment_name.toLowerCase().includes(text.toLowerCase()) ||
        appeal?.course_name.toLowerCase().includes(text.toLowerCase()) ||
        appeal?.course_code
          .toString()
          .toLowerCase()
          .includes(text.toLowerCase()) ||
        (appeal?.student_first_name as string)
          .toLowerCase()
          .includes(text.toLowerCase())
      );
    });
    this.currentAppeal = this.filteredAppeals[0];
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
        width: '50%',
        height: '50%',
        data: { graders, appealID, professor: this.professor },
      });
    } else {
      console.log('appeal already assigned to grader');
      this._snackBar.openFromComponent(GraderAssignedSnackbarComponent, {
        duration: this.durationInSeconds * 1000,
      });
    }
  }

  async unassignGrader(event: MouseEvent) {
    if (this.currentAppeal.grader_id) {
      const graderName = this.currentAppeal.grader_name;
      const studentID = this.currentAppeal.student_id;
      const professorID = this.professor.id;
      console.log(graderName);
      const appealID = this.currentAppeal.appeal_id;
      // open popup to assign grader
      const dialog = this.dialog.open(UnassignGraderPopupComponent, {
        width: '35%',
        height: '35%',
        data: { graderName, appealID, studentID, professorID },
      });
    }
  }
}
