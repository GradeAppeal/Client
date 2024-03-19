import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GravatarModule } from 'ngx-gravatar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/Auth/login/login.component';
import { StudentDashboardComponent } from './components/Student/student-dashboard/student-dashboard.component';

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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

/* Components */
import { ProfessorNavigationComponent } from './components/Professor/professor-navigation/professor-navigation.component';
import { ClosedAppealsComponent } from './components/Professor/closed-appeals/closed-appeals.component';
import { CoursesComponent } from './components/Professor/courses/courses.component';
import { ProfessorInteractionHistoryComponent } from './components/Professor/professor-interaction-history/professor-interaction-history.component';
import { EditTemplatesComponent } from './components/Professor/edit-templates/edit-templates.component';
import { ProfessorAppealInboxComponent } from './components/Professor/professor-appeal-inbox/professor-appeal-inbox.component';
import { StudentNavigationComponent } from './components/Student/student-navigation/student-navigation.component';
import { NewAppealComponent } from './components/Student/new-appeal/new-appeal.component';
import { AssignmentsComponent } from './components/Professor/assignments/assignments.component';
import { AddAssignmentComponent } from './components/Professor/assignments/add-assignment/add-assignment.component';
import { StudentInteractionHistoryComponent } from './components/Student/student-interaction-history/student-interaction-history.component';
import { RegisterComponent } from './components/Auth/register/register.component';
import { DeleteAssignmentComponent } from './components/Professor/assignments/delete-assignment/delete-assignment.component';
import { AddTemplateComponent } from './components/Professor/edit-templates/add-template/add-template.component';
import { DeleteTemplateComponent } from './components/Professor/edit-templates/delete-template/delete-template.component';
import { AddCourseComponent } from './components/Professor/courses/add-course/add-course.component';
import { DeleteCourseComponent } from './components/Professor/courses/delete-course/delete-course.component';
import { GraderInteractionHistoryComponent } from './components/Student/grader-interaction-history/grader-interaction-history.component';
import { SignoutComponent } from './components/Auth/signout/signout.component';
import { CloseAppealPopupComponent } from './components/Professor/professor-appeal-inbox/close-appeal-popup/close-appeal-popup.component';
import { ReopenPopupComponent } from './components/Professor/closed-appeals/reopen-popup/reopen-popup.component';
import { AssignGraderPopupComponent } from './components/Professor/professor-interaction-history/assign-grader-popup/assign-grader-popup.component';
import { RosterComponent } from './components/Professor/roster/roster.component';
import { GraderAssignedSnackbarComponent } from './components/Professor/professor-interaction-history/grader-assigned-snackbar/grader-assigned-snackbar.component';
import { ViewClosedAppealPopupComponent } from './components/Professor/closed-appeals/view-closed-appeal-popup/view-closed-appeal-popup.component';
import { UnassignGraderPopupComponent } from './components/Professor/unassign-grader-popup/unassign-grader-popup.component';
import { DeleteAppealPopupComponent } from './components/Professor/closed-appeals/delete-appeal-popup/delete-appeal-popup.component';
import { RegisterConfirmationPopupComponent } from './components/Auth/register/register-confirmation-popup/register-confirmation-popup.component';
import { ResetPasswordComponent } from './components/Auth/reset-password/reset-password.component';
import { UpdateTemplateComponent } from './components/Professor/edit-templates/update-template/update-template.component';
import { AboutComponent } from './components/about/about.component';
import { AddStudentPopupComponent } from './components/Professor/roster/add-student-popup/add-student-popup.component';
import { GraderDashboardComponent } from './components/Student/grader-dashboard/grader-dashboard.component';
import { LoadingSpinnerComponent } from './components/util-components/loading-spinner/loading-spinner.component';
import { RequestTokenComponent } from './components/Auth/request-token/request-token.component';
import { ConfirmationComponent } from './components/Auth/confirmation/confirmation.component';
import { RedirectSnackbarComponent } from './components/util-components/redirect-snackbar/redirect-snackbar.component';
import { DeleteStudentPopupComponent } from './components/Professor/roster/delete-student-popup/delete-student-popup.component';
import { ResetStudentPasswordPopupComponent } from './components/Professor/roster/reset-student-password-popup/reset-student-password-popup.component';
import { EditGraderComponent } from './components/Professor/assignments/edit-grader/edit-grader.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    StudentDashboardComponent,
    ProfessorNavigationComponent,
    ClosedAppealsComponent,
    CoursesComponent,
    ProfessorInteractionHistoryComponent,
    ProfessorInteractionHistoryComponent,
    EditTemplatesComponent,
    ProfessorAppealInboxComponent,
    StudentNavigationComponent,
    NewAppealComponent,
    AssignmentsComponent,
    AddAssignmentComponent,
    StudentInteractionHistoryComponent,
    RegisterComponent,
    DeleteAssignmentComponent,
    AddTemplateComponent,
    DeleteTemplateComponent,
    AddCourseComponent,
    DeleteCourseComponent,
    GraderInteractionHistoryComponent,
    SignoutComponent,
    CloseAppealPopupComponent,
    ReopenPopupComponent,
    AssignGraderPopupComponent,
    RosterComponent,
    GraderAssignedSnackbarComponent,
    ViewClosedAppealPopupComponent,
    UnassignGraderPopupComponent,
    DeleteAppealPopupComponent,
    RegisterConfirmationPopupComponent,
    UpdateTemplateComponent,
    AboutComponent,
    ResetPasswordComponent,
    AddStudentPopupComponent,
    GraderDashboardComponent,
    LoadingSpinnerComponent,
    ConfirmationComponent,
    RequestTokenComponent,
    RedirectSnackbarComponent,
    DeleteStudentPopupComponent,
    ResetStudentPasswordPopupComponent,
    EditGraderComponent,
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
    MatCheckboxModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
