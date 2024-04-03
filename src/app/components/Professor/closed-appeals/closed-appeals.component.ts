import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { ReopenPopupComponent } from './reopen-popup/reopen-popup.component';
import { ViewClosedAppealPopupComponent } from './view-closed-appeal-popup/view-closed-appeal-popup.component';
import { Professor } from 'src/app/shared/interfaces/psql.interface';
import { DeleteAppealPopupComponent } from './delete-appeal-popup/delete-appeal-popup.component';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-closed-appeals',
  templateUrl: './closed-appeals.component.html',
  styleUrls: ['./closed-appeals.component.scss'],
})
export class ClosedAppealsComponent implements OnInit {
  showReopenPopup: boolean = false;
  reopenPopupTitle: string = 'Reopen this appeal?';
  reopenPopupMessage: string;
  reopenActionButtonText: string = 'Reopen';
  toggleReopenPopup() {
    this.showReopenPopup = !this.showReopenPopup;
  }
  professor: Professor;
  closedAppeals: ProfessorAppeal[];
  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private sharedService: SharedService,
    private professorService: ProfessorService
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.professor = {
          id: user.id,
          first_name: user.user_metadata['first_name'],
          last_name: user.user_metadata['last_name'],
          email: user.user_metadata['email'],
        };
      }
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.closedAppeals =
        await this.professorService.fetchClosedProfessorAppeals(
          this.professor.id
        );
      console.log(this.closedAppeals);
      this.handleAppealDeletes();
    } catch (error) {
      console.log({ error });
    }
  }

  handleAppealDeletes(): void {
    this.sharedService
      .getTableChanges(
        'Appeals',
        'delete-appeal-channel',
        `profesor_id=eq.${this.professor.id}`
      )
      .subscribe(async (update: any) => {
        // get the newly updated row
        const record = update.new?.id ? update.new : update.old;
        const event = update.eventType;
        //if (!record || event !== 'DELETE') return;
        console.log({ update }, 'deleted appeal!');
      });
  }

  formatLocalTimestamp(last_modified?: Date | string) {
    const newTime = new Date(last_modified as string);
    return newTime.toLocaleString();
  }

  async onReopenAppeal(i: number) {
    const reopenAppeal = this.closedAppeals[i];
    // const dialogRef = this.dialog.open(ReopenPopupComponent, {
    //   data: { reopenAppeal },
    // });
    const reopenedAppealID = await this.professorService.updateAppealOpenStatus(
      this.closedAppeals[i].appeal_id
    );
    // update UI: get rid of reopened appeal
    // dialogRef.afterClosed().subscribe((reopenAppealId: number) => {
    //   this.closedAppeals = this.closedAppeals.filter(
    //     (appeal) => appeal.appeal_id !== reopenAppealId
    //   );
    // });
    this.toggleReopenPopup();
  }

  onViewAppeal(i: number) {
    const closedAppeal = this.closedAppeals[i];
    const dialogRef = this.dialog.open(ViewClosedAppealPopupComponent, {
      data: { closedAppeal },
    });
  }

  onDeleteAppeal(i: number) {
    const appealToDelete = this.closedAppeals[i];
    const dialogRef = this.dialog.open(DeleteAppealPopupComponent, {
      data: { appealToDelete },
    });
    dialogRef.afterClosed().subscribe((deletedAppealId: number) => {
      this.closedAppeals = this.closedAppeals.filter(
        (appeal) => appeal.appeal_id !== deletedAppealId
      );
    });
  }
}
