import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GravatarModule } from 'ngx-gravatar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/login/login.component';
import { StudentDashboardComponent } from './components/Student/student-dashboard/student-dashboard.component';
// import { AccountComponent } from './components/account/account.component';

/* Material Design Imports  */
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ProfessorNavigationComponent } from './components/Professor/professor-navigation/professor-navigation.component';
import { ClosedAppealsComponent } from './components/Professor/closed-appeals/closed-appeals.component';
import { ProfileComponent } from './components/Professor/profile/profile.component';
import { ProfessorInteractionHistoryComponent } from './components/Professor/professor-interaction-history/professor-interaction-history.component';
import { EditTemplatesComponent } from './components/Professor/edit-templates/edit-templates.component';
import { ProfessorAppealInboxComponent } from './components/Professor/professor-appeal-inbox/professor-appeal-inbox.component';
import { StudentNavigationComponent } from './components/Student/student-navigation/student-navigation.component';
import { NewAppealComponent } from './components/Student/new-appeal/new-appeal.component';
import { EditStudentsPopUpComponent } from './components/Student/edit-students-pop-up/edit-students-pop-up.component';
import { AssignmentsComponent } from './components/Professor/assignments/assignments.component';
import { AddAssignmentComponent } from './components/Professor/assignments/add-assignment/add-assignment.component';
import { StudentInteractionHistoryComponent } from './components/Student/student-interaction-history/student-interaction-history.component';
import { DeleteAssignmentComponent } from './components/Professor/assignments/delete-assignment/delete-assignment.component';
import { AddTemplateComponent } from './components/Professor/edit-templates/add-template/add-template.component';
import { DeleteTemplateComponent } from './components/Professor/edit-templates/delete-template/delete-template.component';
import { GraderInteractionHistoryComponent } from './components/Student/grader-interaction-history/grader-interaction-history.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    StudentDashboardComponent,
    ProfessorNavigationComponent,
    ClosedAppealsComponent,
    ProfileComponent,
    ProfessorInteractionHistoryComponent,
    ProfessorInteractionHistoryComponent,
    EditTemplatesComponent,
    ProfessorAppealInboxComponent,
    StudentNavigationComponent,
    NewAppealComponent,
    EditStudentsPopUpComponent,
    AssignmentsComponent,
    AddAssignmentComponent,
    StudentInteractionHistoryComponent,
    DeleteAssignmentComponent,
    AddTemplateComponent,
    DeleteTemplateComponent,
    GraderInteractionHistoryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GravatarModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatTabsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatInputModule,
    MatDialogModule,
    MatMenuModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
