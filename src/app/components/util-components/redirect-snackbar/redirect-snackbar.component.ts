import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-redirect-snackbar',
  templateUrl: './redirect-snackbar.component.html',
  styleUrls: ['./redirect-snackbar.component.scss'],
})
export class RedirectSnackbarComponent {
  message: string;
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: string) {
    this.message = data;
  }
}
