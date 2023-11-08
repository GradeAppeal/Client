import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signout',
  templateUrl: './signout.component.html',
  styleUrls: ['./signout.component.scss'],
})
export class SignoutComponent {
  constructor(private authService: SupabaseService, private router: Router) {}

  async onSignout() {
    try {
      await this.authService.signOut();
      this.router.navigateByUrl('login');
    } catch (err) {
      console.log({ err });
      throw new Error('onSignout');
    }
  }
}
