import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { Professor } from 'src/app/shared/interfaces/psql.interface';
import { SharedService } from 'src/app/services/shared.service';
import { GenericPopupComponent } from '../../generic-popup/generic-popup.component';

@Component({
  selector: 'app-closed-appeals',
  templateUrl: './closed-appeals.component.html',
  styleUrls: ['./closed-appeals.component.scss'],
})
export class ClosedAppealsComponent implements OnInit {
  //reopen popup
  showReopenPopup: boolean = false;
  //delete popup
  showDeletePopup: boolean;
  deletePopupTitle: string = 'Delete this appeal?';
  deletePopupMessage: string = 'This action is irreversible!';
  deleteActionButtonText: string = 'Delete';
  // toggleReopenPopup() {
  //   this.showReopenPopup = !this.showReopenPopup;
  // }
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
  toggleReopenPopup(i: number) {
    const reopenAppeal = this.closedAppeals[i];
    const dialogRef = this.dialog.open(GenericPopupComponent, {
      data: {
        title: 'Reopen Appeal?',
        actionButtonText: 'Reopen',
        action: async () => {
          const reopenedAppealID =
            await this.professorService.updateAppealOpenStatus(
              this.closedAppeals[i].appeal_id
            );
          dialogRef.close(reopenedAppealID);
        },
      },
    });

    dialogRef.afterClosed().subscribe((reopenAppealId: number) => {
      this.closedAppeals = this.closedAppeals.filter(
        (appeal) => appeal.appeal_id !== reopenAppealId
      );
    });
  }
  async onReopenAppeal(i: number) {
    const reopenedAppealID = await this.professorService.updateAppealOpenStatus(
      this.closedAppeals[i].appeal_id
    );
  }

  toggleDeleteAppealPopup(i: number) {
    console.log('what');
    const dialogRef = this.dialog.open(GenericPopupComponent, {
      data: {
        title: 'Delete Appeal?',
        actionButtonText: 'Delete',
        action: async () => {
          const deletedAppealID = await this.professorService.deleteAppeal(
            this.closedAppeals[i].appeal_id
          );
          dialogRef.close(deletedAppealID);
        },
      },
    });

    dialogRef.afterClosed().subscribe((deletedAppealId: number) => {
      this.closedAppeals = this.closedAppeals.filter(
        (appeal) => appeal.appeal_id !== deletedAppealId
      );
    });
  }

  toggleViewAppealPopup(i: number) {
    const dialogRef = this.dialog.open(GenericPopupComponent, {
      data: {
        title: this.closedAppeals[i].assignment_name,
        message: this.closedAppeals[i].appeal_text,
        actionButtonText: 'Done',
        action: () => dialogRef.close(),
      },
    });
  }
}
