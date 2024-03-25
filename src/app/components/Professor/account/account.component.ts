import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Session, User } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { SharedService } from 'src/app/services/shared.service';
import { Professor } from 'src/app/shared/interfaces/psql.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  session: Session;
  user: User;
  professor: Professor;
  passwordMinLength = 6;
  newPassword: string;
  emailFrequency: string;
  form: FormGroup;
  frequencies = ['daily', 'weekly', 'monthly'];
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user && typeof user !== 'boolean') {
        this.user = user;
        this.professor = {
          id: this.user.id,
          first_name: this.user.user_metadata['first_name'],
          last_name: this.user.user_metadata['last_name'],
          email: this.user.email as string,
        };
      }
    });
  }

  ngOnInit() {
    this.form = this.fb.group({
      password: ['', [Validators.minLength(6)]],
      frequency: ['', Validators.required],
    });
  }

  async onSaveSettings() {
    const { password, frequency } = this.form.value;
    // if user entered new password, update the password
    try {
      if (password) {
        // await this.authService.updatePassword(password);
        this.snackBar.open('Successfully Updated Password', '', {
          panelClass: ['blue-snackbar'],
          duration: 2000,
        });
      }
    } catch (error) {
      this.snackBar.open(`Error: ${error}`, 'dismiss', {
        panelClass: ['red-snackbar'],
        duration: 3000,
      });
    }
    // TODO: configure frequency after figuring out edge functions
  }
}
