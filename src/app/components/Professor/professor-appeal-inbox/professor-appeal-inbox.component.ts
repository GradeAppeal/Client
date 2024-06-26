import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Course, Professor } from 'src/app/shared/interfaces/psql.interface';
import { formatTimestamp } from 'src/app/shared/functions/general.util';
import { Session, User } from '@supabase/supabase-js';

import { AssignGraderPopupComponent } from '../professor-interaction-history/assign-grader-popup/assign-grader-popup.component';
import { GraderAssignedSnackbarComponent } from '../professor-interaction-history/grader-assigned-snackbar/grader-assigned-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedService } from 'src/app/services/shared.service';
import { UnassignGraderPopupComponent } from '../unassign-grader-popup/unassign-grader-popup.component';
import { getTimestampTz } from 'src/app/shared/functions/time.util';
import { GenericPopupComponent } from '../../generic-popup/generic-popup.component';

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
  noAppeals: boolean;
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
      this.currentAppeal = this.professorAppeals[0];
      this.fetchedAppeals = true;
      this.professorCourses = await this.professorService.fetchProfessorCourses(
        this.professor.id
      );

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
        // get the newly updated row
        const record = update.new?.id ? update.new : update.old;
        const event = update.eventType;
        console.log(record, event);
        if (!record) return;
        // insert new appeals by student
        if (event === 'INSERT') {
          const newAppeal = await this.professorService.getNewProfessorAppeal(
            record.id
          );
          // latest appeal floats to the top
          this.professorAppeals.unshift(...newAppeal);
        }
        // update grader status
        else if (event === 'UPDATE') {
          if (!record.is_open) {
            this.professorAppeals = this.professorAppeals.filter(
              (appeal) => appeal.appeal_id !== record.id
            );
            this.filteredAppeals = this.filteredAppeals.filter(
              (appeal) => appeal.appeal_id !== record.id
            );
            this.currentAppeal =
              this.currentAppeal.appeal_id !== record.id
                ? this.currentAppeal
                : this.filteredAppeals[0];
          }
          console.log({ record });
          this.professorAppeals = this.professorAppeals.map((appeal) => {
            if (appeal.appeal_id === record.id) {
              return { ...appeal, grader_id: record.grader_id };
            } else {
              return appeal;
            }
          });
          this.filteredAppeals = this.professorAppeals;
          if (record.id === this.currentAppeal.appeal_id) {
            this.currentAppeal.grader_id = record.grader_id;
          }
        }
        // safety delete check in case closed appeal not removed from appeal inbox
        else if (event === 'DELETE') {
          this.professorAppeals = this.professorAppeals.filter(
            (appeal) => appeal.appeal_id !== record.id
          );
          this.filteredAppeals = this.filteredAppeals.filter(
            (appeal) => appeal.appeal_id !== record.id
          );
        }
      });
  }

  selectAppeal(appeal: any) {
    this.currentAppeal = appeal;
  }

  formatTimestamp(timestamp: Date): { date: string; time: string } {
    return formatTimestamp(timestamp);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  /**
   * Filters appeals based on search
   * @param text search query
   */
  filterResults(text: string): void {
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

  /**
   * update appeal list based on search
   * @param filterValue search query
   */
  onInputChange(filterValue: string): void {
    //if input is blank, just show all appeals
    if (filterValue.trim() === '') {
      this.filteredAppeals = this.professorAppeals;
    }
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
        data: { graders, appealID, professor: this.professor },
      });
    } else {
      console.log('appeal already assigned to grader');
      this._snackBar.openFromComponent(GraderAssignedSnackbarComponent, {
        duration: this.durationInSeconds * 1000,
      });
    }
  }

  async unassignGrader() {
    if (this.currentAppeal.grader_id) {
      // // open popup to assign grader
      await this.professorService.updateUnassignAppealGrader(
        this.currentAppeal.appeal_id
      );
      const now = getTimestampTz(new Date());
      const message = 'Notification: Grader Unassigned';

      await this.sharedService.insertMessage(
        this.currentAppeal.appeal_id,
        this.professor.id,
        this.currentAppeal.student_id,
        now,
        message,
        false,
        '',
        '',
        false
      );
    }
  }

  toggleCloseAppealPopup() {
    const dialogRef = this.dialog.open(GenericPopupComponent, {
      data: {
        title: 'Close Appeal?',
        message: 'Are you sure you want to close this appeal?',
        actionButtonText: 'Close',
        action: async () => {
          const closedAppealID =
            await this.professorService.updateAppealOpenStatus(
              this.currentAppeal.appeal_id
            );

          dialogRef.close(closedAppealID);
        },
      },
    });

    dialogRef.afterClosed().subscribe((closedAppealId: number) => {
      this.filteredAppeals = this.filteredAppeals.filter(
        (appeal) => appeal.appeal_id !== closedAppealId
      );
    });
  }
  toggleUnassignGraderPopup(): void {
    const dialogRef = this.dialog.open(GenericPopupComponent, {
      data: {
        title: 'Unassign Appeal?',
        message:
          'Are you sure you want to unassign the grader for this appeal?',
        actionButtonText: 'Unassign',
        action: async () => {
          if (this.currentAppeal.grader_id) {
            // // open popup to assign grader
            await this.professorService.updateUnassignAppealGrader(
              this.currentAppeal.appeal_id
            );
            const now = getTimestampTz(new Date());
            const message = 'Notification: Grader Unassigned';

            await this.sharedService.insertMessage(
              this.currentAppeal.appeal_id,
              this.professor.id,
              this.currentAppeal.student_id,
              now,
              message,
              false,
              '',
              '',
              false
            );
          }

          dialogRef.close();
        },
      },
    });

    dialogRef.afterClosed().subscribe((closedAppealId: number) => {
      this.filteredAppeals = this.filteredAppeals.filter(
        (appeal) => appeal.appeal_id !== closedAppealId
      );
    });
  }
}
