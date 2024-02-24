import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { RegisterConfirmationPopupComponent } from './register-confirmation-popup/register-confirmation-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [
        '',
        [Validators.required, Validators.email, this.validateCalvinEmail],
      ],
    });
  }

  /**
   * Send verification email with One-time-password
   */
  async onRegister() {
    if (this.registerForm.valid) {
      const { firstName, lastName, email } = this.registerForm.value;
      try {
        await this.authService.signInWithOtp(email, firstName, lastName);
        const dialog = this.dialog.open(RegisterConfirmationPopupComponent, {
          data: {
            email,
          },
        });
        dialog.afterClosed().subscribe((res) => {
          this.router.navigateByUrl('/login');
        });
      } catch (err) {
        console.log({ err });
        this.router.navigateByUrl('/login');
      }
    }
  }

  validateCalvinEmail(control: any) {
    const email: string = control.value;
    if (!/^[a-zA-Z]+[.][a-zA-Z]+@calvin\.edu$/.test(email)) {
      return { invalidEmailFormat: true };
    }
    return null;
  }
}
