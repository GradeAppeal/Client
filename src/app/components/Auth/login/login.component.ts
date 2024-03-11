import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
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
    private readonly authService: AuthService,
    private readonly formBuilder: FormBuilder,
    private router: Router
  ) {}

  async ngOnInit() {}

  async onLogin(): Promise<void> {
    this.loading = true;
    const email = this.loginForm.value.email as string;
    const password = this.loginForm.value.password as string;
    try {
      const authData = await this.authService.signIn(email, password);
      const authEmail = authData.user?.email as string;
      const authUserRole = await this.authService.getRole(authEmail);
      if (authUserRole === 'professor') {
        this.router.navigateByUrl('/professor/appeal-inbox');
      } else if (authUserRole === 'student') {
        this.router.navigateByUrl('/student/courses');
      }
    } catch (error) {
      console.log({ error });
      if (error) {
        alert(
          `A user for ${email} does not exist or the password is incorrect`
        );
      }
    } finally {
      this.loginForm.reset();
      this.loading = false;
    }
  }

  onRegister() {
    this.router.navigateByUrl('/register');
  }

  onRequestToken() {
    this.router.navigateByUrl('/request-token');
  }
}
