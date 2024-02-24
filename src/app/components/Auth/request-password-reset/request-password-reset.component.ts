import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestPasswordResetSnackbarComponent } from './request-password-reset-snackbar/request-password-reset-snackbar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-password-reset',
  templateUrl: './request-password-reset.component.html',
  styleUrls: ['./request-password-reset.component.scss'],
})
export class RequestPasswordResetComponent {
  passwordRequestForm: FormGroup;
  durationInSeconds: number = 2;

  constructor(
    private professorService: ProfessorService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.passwordRequestForm = new FormGroup({
      email: new FormControl<string>('', [
        Validators.required,
        Validators.email,
      ]),
    });
  }

  /**
   * If the user exists, send password reset link via email
   */
  async onRequestPasswordReset() {
    const { email } = this.passwordRequestForm.value;
    await this.authService.sendPasswordResetVerification(email);
    const message = `Reset link sent to ${email}. Redirecting...`;
    const snackbarRef = this.snackBar.openFromComponent(
      RequestPasswordResetSnackbarComponent,
      {
        duration: this.durationInSeconds * 1000,
        data: message,
      }
    );
    snackbarRef.afterDismissed().subscribe(() => {
      this.router.navigateByUrl('/');
    });
  }
}
