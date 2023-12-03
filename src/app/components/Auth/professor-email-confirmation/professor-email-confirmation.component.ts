import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-professor-email-confirmation',
  templateUrl: './professor-email-confirmation.component.html',
  styleUrls: ['./professor-email-confirmation.component.scss'],
})
export class ProfessorEmailConfirmationComponent {
  confirmationUrl: string | null;
  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params: Params) => {
      this.confirmationUrl = params['confirmation_url'] || null;
      // You can then use this.confirmationUrl as needed in your component
      const confirmationURL = this.confirmationUrl;
      console.log({ confirmationURL });
    });
  }

  onConfirmEmail() {
    console.log(this.confirmationUrl);
  }
}
