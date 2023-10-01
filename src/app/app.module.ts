import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GravatarModule } from 'ngx-gravatar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/login/login.component';
import { StudentDashboardComponent } from './components/home/student-dashboard/student-dashboard.component';
import { ProfessorDashboardComponent } from './components/home/professor-dashboard/professor-dashboard.component';
// import { AccountComponent } from './components/account/account.component';g

/* Material Design Imports  */
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatDialogModule} from '@angular/material/dialog';


import { ProfessorNavigationComponent } from './components/professor-navigation/professor-navigation.component';
import { ClosedAppealsComponent } from './components/closed-appeals/closed-appeals.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChatComponent } from './components/chat/chat.component';
import { EditTemplatesComponent } from './components/edit-templates/edit-templates.component';
import { ProfessorAppealInboxComponent } from './components/professor-appeal-inbox/professor-appeal-inbox.component';
import { StudentNavigationComponent } from './student-navigation/student-navigation.component';
import { InteractionHistoryComponent } from './interaction-history/interaction-history.component';
import { NewAppealComponent } from './new-appeal/new-appeal.component';
import { EditStudentsPopUpComponent } from './edit-students-pop-up/edit-students-pop-up.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    StudentDashboardComponent,
    ProfessorDashboardComponent,
    ProfessorNavigationComponent,
    ClosedAppealsComponent,
    ProfileComponent,
    ChatComponent,
    EditTemplatesComponent,
    ProfessorAppealInboxComponent,
    StudentNavigationComponent,
    InteractionHistoryComponent,
    NewAppealComponent,
    EditStudentsPopUpComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GravatarModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatListModule,
    MatIconModule,
    MatTabsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatInputModule,
    MatDialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
