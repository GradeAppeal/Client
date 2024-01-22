import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';
import { passwordMatchValidator } from 'src/app/shared/functions/form.validator.util';

@Component({
  selector: 'app-student-set-password',
  templateUrl: './student-set-password.component.html',
  styleUrls: ['./student-set-password.component.scss'],
})
export class StudentSetPasswordComponent implements OnInit {
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

    // Get auth user
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
      }
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

  async onSetPassword() {
    if (this.user) {
      const id = this.user.id;
      const { newPassword } = this.passwordForm.value;
      try {
        await this.authService.setStudentPassword(id, newPassword as string);
        this.router.navigateByUrl('/student/course-dashboard');
      } catch (error) {
        alert(error);
        this.router.navigateByUrl('/');
      }
    }
  }
}
