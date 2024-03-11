import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { RedirectSnackbarComponent } from '../../util-components/redirect-snackbar/redirect-snackbar.component';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent {
  verificationType: 'invite' | 'recovery';
  loginForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    // Get verification type
    this.route.queryParams.subscribe((params: Params) => {
      this.verificationType = params['type'] || null;
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const { email, token } = this.loginForm.value;
      try {
        const session = await this.authService.verifyAccount(email, token);
        const verified = session ? true : false;
        const message = verified
          ? 'Verified. Redirecting...'
          : 'Token expired or invalid. Redirecting...';
        const snackbarRef = this.snackBar.openFromComponent(
          RedirectSnackbarComponent,
          {
            duration: 2000,
            data: message,
          }
        );
        snackbarRef.afterDismissed().subscribe(() => {
          verified
            ? this.router.navigateByUrl('/reset-password')
            : this.router.navigateByUrl('/');
        });
      } catch (err) {
        console.log(err);
        const message = 'Error verifying account. Redirecting...';
        const snackbarRef = this.snackBar.openFromComponent(
          RedirectSnackbarComponent,
          {
            duration: 2000,
            data: message,
          }
        );
        snackbarRef.afterDismissed().subscribe(() => {
          this.router.navigateByUrl('/');
        });
      }
    } else {
      console.log('form is invalid');
      // Mark fields as touched to display validation messages
      this.loginForm.markAllAsTouched();
    }
  }
}
