import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-close-appeal-popup',
  templateUrl: './close-appeal-popup.component.html',
  styleUrls: ['./close-appeal-popup.component.scss'],
})
export class CloseAppealPopupComponent {
  constructor(private authService: AuthService, private router: Router) {}
  async closeAppeal() {
    try {
      //this.router.navigateByUrl('professor/closed-appeals');
    } catch (err) {
      console.log({ err });
      throw new Error('CloseAppeal');
    }
  }
}
