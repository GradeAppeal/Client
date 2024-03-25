import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User } from '@supabase/supabase-js';
import { AuthService } from 'src/app/services/auth.service';
import { ProfessorService } from 'src/app/services/professor.service';
import { SharedService } from 'src/app/services/shared.service';
import { Professor } from 'src/app/shared/interfaces/psql.interface';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  session: Session;
  user: User;
  professor: Professor;
  newPassword: string;
  emailFrequency: string;
  constructor(
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedService,
    private professorService: ProfessorService
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
  changePassword() {}
  saveEmailPreferences() {}
}
