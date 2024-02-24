import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-register-confirmation-popup',
  templateUrl: './register-confirmation-popup.component.html',
  styleUrls: ['./register-confirmation-popup.component.scss'],
})
export class RegisterConfirmationPopupComponent {
  email: string;
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { email: string }
  ) {
    this.email = data.email;
  }
}
