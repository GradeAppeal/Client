import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SupabaseService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm = this.formBuilder.group({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  constructor(
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder,
    private router: Router
  ) {}

  async onRegister() {
    try {
      const { firstName, lastName, email, password } = this.registerForm.value;
      const authData = await this.supabase.signUp(
        firstName as string,
        lastName as string,
        email as string,
        password as string
      );

      const authEmail = authData.user?.email as string;
      const authUserRole = await this.supabase.getRole(authEmail);
      console.log({ authUserRole });
      // TODO Students shouldn't be able to sign in!
      if (authUserRole === 'admin') {
        this.router.navigateByUrl('/admin');
      } else if (authUserRole === 'professor') {
        this.router.navigateByUrl('/professor/appeal-inbox');
      } else if (authUserRole === 'student') {
        this.router.navigateByUrl('/student');
      }
    } catch (err) {
      console.log({ err });
      this.router.navigateByUrl('/login');
    }
  }
}
