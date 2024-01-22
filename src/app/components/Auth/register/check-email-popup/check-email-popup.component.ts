import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-check-email-popup',
  templateUrl: './check-email-popup.component.html',
  styleUrls: ['./check-email-popup.component.scss'],
})
export class CheckEmailPopupComponent {
  header: string;
  text: string;
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { email: string }
  ) {
    this.header = 'Email confirmation needed';
    this.text = `Check your email inbox at ${data.email}`;
  }
}
