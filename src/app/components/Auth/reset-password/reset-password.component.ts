import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  constructor(private authService: AuthService) {
    this.authService.getCurrentUser().subscribe((user) => {
      console.log({ user });
    });
  }
}
