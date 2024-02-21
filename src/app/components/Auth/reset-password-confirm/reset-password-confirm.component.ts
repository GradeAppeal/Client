import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-reset-password-confirm',
  templateUrl: './reset-password-confirm.component.html',
  styleUrls: ['./reset-password-confirm.component.scss'],
})
export class ResetPasswordConfirmComponent {
  resetURL: string | null;
  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params: Params) => {
      console.log({ params });
      this.resetURL = params['confirmation_url'] || null;
      this.resetURL = decodeURIComponent(this.resetURL as string);
      // You can then use this.confirmationUrl as needed in your component
      const resetURL = this.resetURL;
      console.log({ resetURL });
    });
  }
}
