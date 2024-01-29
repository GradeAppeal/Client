import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-request-password-reset-snackbar',
  templateUrl: './request-password-reset-snackbar.component.html',
  styleUrls: ['./request-password-reset-snackbar.component.scss'],
})
export class RequestPasswordResetSnackbarComponent {
  message: string;
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: string) {
    this.message = data;
  }
}
