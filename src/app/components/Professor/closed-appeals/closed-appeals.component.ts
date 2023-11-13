import { Component, OnInit } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';
import { MatDialog } from '@angular/material/dialog';
import { SupabaseService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';
import { ReopenPopupComponent } from './reopen-popup/reopen-popup.component';

@Component({
  selector: 'app-closed-appeals',
  templateUrl: './closed-appeals.component.html',
  styleUrls: ['./closed-appeals.component.scss'],
})
export class ClosedAppealsComponent implements OnInit {
  session: Session;
  user: User;
  closedAppeals: ProfessorAppeal[] = [];
  constructor(
    private dialog: MatDialog,
    private authService: SupabaseService,
    private professorService: ProfessorService
  ) {}

  async ngOnInit(): Promise<void> {
    this.session = (await this.authService.getSession()) as Session;
    this.user = this.session.user;
    this.closedAppeals =
      await this.professorService.fetchClosedProfessorAppeals(this.user.id);
  }

  async onReopenAppeal(i: number) {
    const reopenAppeal = this.closedAppeals[i];
    const dialogRef = this.dialog.open(ReopenPopupComponent, {
      width: '30%',
      height: '25%',
      data: { reopenAppeal },
    });

    // update UI: get rid of reopened appeal
    dialogRef.afterClosed().subscribe((reopenAppealId: number) => {
      this.closedAppeals = this.closedAppeals.filter(
        (appeal) => appeal.appeal_id !== reopenAppealId
      );
    });
  }
}
