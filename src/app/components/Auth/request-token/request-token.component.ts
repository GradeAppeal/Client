import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RedirectSnackbarComponent } from '../../util-components/redirect-snackbar/redirect-snackbar.component';

@Component({
  selector: 'app-request-token',
  templateUrl: './request-token.component.html',
  styleUrls: ['./request-token.component.scss'],
})
export class RequestTokenComponent {
  passwordRequestForm: FormGroup;
  durationInSeconds: number = 2;

  constructor(
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
      RedirectSnackbarComponent,
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
