import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loading = false;

  loginForm = this.formBuilder.group({
    email: '',
    password: '',
  });

  constructor(
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder,
    private router: Router
  ) {}

  async ngOnInit() {}

  async onLogin(): Promise<void> {
    this.loading = true;
    const email = this.loginForm.value.email as string;
    const password = this.loginForm.value.password as string;
    try {
      await this.supabase.signInWithEmail(email, password);
      this.router.navigateByUrl('/admin');
    } catch (error) {
      if (error instanceof Error) {
        alert(
          `A user for ${email} does not exist or the password is incorrect`
        );
      }
    } finally {
      this.loginForm.reset();
      this.loading = false;
    }
  }
  onProfessor() {
    this.router.navigateByUrl('/professor/appeal-inbox');
  }

  onStudent() {
    this.router.navigateByUrl('/student/course-dashboard');
  }

  onSignup() {}
}
