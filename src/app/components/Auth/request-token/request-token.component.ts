import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-request-token',
  templateUrl: './request-token.component.html',
  styleUrls: ['./request-token.component.scss'],
})
export class RequestTokenComponent {
  otpRequestForm: FormGroup;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.otpRequestForm = new FormGroup({
      email: new FormControl<string>('', [
        Validators.required,
        Validators.email,
      ]),
    });
  }

  onRequestOtp() {
    const { email } = this.otpRequestForm.value;
    this.authService.signIn;
  }
}
