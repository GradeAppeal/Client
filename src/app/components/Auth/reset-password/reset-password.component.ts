import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';
import { passwordMatchValidator } from 'src/app/shared/functions/form.validator.util';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  user: User | null = null;
  tokenHash: string | null;
  verified: boolean = false;
  passwordForm: FormGroup;
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
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

  async ngOnInit() {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
      }
    });
  }

  async onResetPassword() {
    if (this.user) {
      const id = this.user.id;
      const { newPassword } = this.passwordForm.value;
      try {
        await this.authService.updatePassword(newPassword as string);
        this.router.navigateByUrl('/');
      } catch (error) {
        alert(error);
        this.router.navigateByUrl('/');
      }
    } else {
      alert('user undefined');
    }
  }
}
