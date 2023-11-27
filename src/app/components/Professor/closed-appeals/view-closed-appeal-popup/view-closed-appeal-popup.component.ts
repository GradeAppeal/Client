import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProfessorAppeal } from 'src/app/shared/interfaces/professor.interface';

@Component({
  selector: 'app-view-closed-appeal-popup',
  templateUrl: './view-closed-appeal-popup.component.html',
  styleUrls: ['./view-closed-appeal-popup.component.scss'],
})
export class ViewClosedAppealPopupComponent {
  closedAppeal: ProfessorAppeal;
  header: string;
  appealText: string;
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { closedAppeal: ProfessorAppeal }
  ) {
    this.closedAppeal = data.closedAppeal;
  }

  ngOnInit() {
    this.header = `${this.closedAppeal.student_first_name} ${this.closedAppeal.student_last_name} - ${this.closedAppeal.assignment_name}`;
    this.appealText = this.closedAppeal.appeal_text;
  }
}
