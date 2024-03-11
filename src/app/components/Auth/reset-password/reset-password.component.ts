import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';
import { passwordMatchValidator } from 'src/app/shared/functions/form.validator.util';
import { RedirectSnackbarComponent } from '../../util-components/redirect-snackbar/redirect-snackbar.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  user: User | null = null;
  type: string;
  passwordForm: FormGroup;
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // check for user
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
      }
      // navigate to home if auth session not initialized
      else {
        this.router.navigateByUrl('/');
      }
    });
  }

  async ngOnInit() {
    // initialize password form
    this.passwordForm = new FormGroup(
      {
        newPassword: new FormControl<string>('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl<string>('', [Validators.required]),
      },
      { validators: passwordMatchValidator }
    );
  }

  async onResetPassword() {
    const { newPassword } = this.passwordForm.value;
    try {
      await this.authService.updatePassword(newPassword as string);
      const message = 'Update successful. Redirecting...';
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
    } catch (error) {
      const message = `${error}. Redirecting...`;
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
  }
}
