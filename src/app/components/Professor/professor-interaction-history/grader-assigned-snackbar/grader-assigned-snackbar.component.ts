import { Component, inject } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-grader-assigned-snackbar',
  templateUrl: './grader-assigned-snackbar.component.html',
  styleUrls: ['./grader-assigned-snackbar.component.scss'],
})
export class GraderAssignedSnackbarComponent {
  snackBarRef = inject(MatSnackBarRef);
}
