import { Component } from '@angular/core';

export interface User {
  username: string;
  password: string;
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {

  currentUser = {} as User;
  onLoginSubmit() {
    console.log(this.currentUser.username, this.currentUser.password);
  }
}