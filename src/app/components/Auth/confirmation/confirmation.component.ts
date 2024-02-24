import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';

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
    private authService: AuthService
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
        if (session) {
          this.router.navigateByUrl(`/reset-password`);
        }
      } catch (err) {
        console.log({ err });
      }
    } else {
      // Mark fields as touched to display validation messages
      this.loginForm.markAllAsTouched();
    }
  }
}
