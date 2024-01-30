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
    // Get token hash value
    this.route.queryParams.subscribe((params: Params) => {
      this.tokenHash = params['token_hash'] || null;
      const tokenHash = this.tokenHash;
      console.log({ tokenHash });
    });

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
    // verify user with token hash
    try {
      if (this.tokenHash) {
        const verification = await this.authService.verifyOtp(this.tokenHash);
        // console.log({ verification });
        this.verified = true;
      } else {
        this.router.navigateByUrl('/');
      }
    } catch (error) {
      console.log({ error });
      this.router.navigateByUrl('/');
    }
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
    }
  }
}
