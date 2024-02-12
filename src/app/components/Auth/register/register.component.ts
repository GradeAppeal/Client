import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { CheckEmailPopupComponent } from './check-email-popup/check-email-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  constructor(
    private dialog: MatDialog,
    private readonly authService: AuthService,
    private readonly formBuilder: FormBuilder,
    private router: Router
  ) {}

  async onRegister() {
    try {
      const { firstName, lastName, email, password } = this.registerForm.value;
      const authData = await this.authService.signUp(
        firstName as string,
        lastName as string,
        email as string,
        password as string
      );

      const authEmail = authData.user?.email as string;
      const authUserRole = await this.authService.getRole(authEmail);
      console.log({ authUserRole });
      //TODO Students shouldn't be able to sign in!
      if (authUserRole === 'admin') {
        this.router.navigateByUrl('/admin');
      } else if (authUserRole === 'professor') {
        const dialogRef = this.dialog.open(CheckEmailPopupComponent, {
          width: '50%',
          height: '50%',
          data: { firstName, lastName, email },
        });

        dialogRef.afterClosed().subscribe(() => {
          this.router.navigateByUrl('/login');
        });
        // this.router.navigateByUrl('/professor/appeal-inbox');
      } else if (authUserRole === 'student') {
        const dialogRef = this.dialog.open(CheckEmailPopupComponent, {
          width: '50%',
          height: '50%',
          data: { firstName, lastName, email },
        });

        dialogRef.afterClosed().subscribe(() => {
          this.router.navigateByUrl('/login');
        });
      }
      // this.router.navigateByUrl('/student');
    } catch (err) {
      console.log({ err });
      this.router.navigateByUrl('/login');
    }
  }

  validateEmailFormat(control: any) {
    const email: string = control.value;
    if (!/^[a-zA-Z]+[.][a-zA-Z]+@calvin\.edu$/.test(email)) {
      return { invalidEmailFormat: true };
    }
    return null;
  }
}
