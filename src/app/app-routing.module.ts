import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/Auth/login/login.component';
import { StudentDashboardComponent } from './components/Student/student-dashboard/student-dashboard.component';
import { ClosedAppealsComponent } from './components/Professor/closed-appeals/closed-appeals.component';
import { CoursesComponent } from './components/Professor/courses/courses.component';
import { ProfessorNavigationComponent } from './components/Professor/professor-navigation/professor-navigation.component';
import { ProfessorInteractionHistoryComponent } from './components/Professor/professor-interaction-history/professor-interaction-history.component';
import { EditTemplatesComponent } from './components/Professor/edit-templates/edit-templates.component';
import { StudentNavigationComponent } from './components/Student/student-navigation/student-navigation.component';
import { NewAppealComponent } from './components/Student/new-appeal/new-appeal.component';
import { ProfessorAppealInboxComponent } from './components/Professor/professor-appeal-inbox/professor-appeal-inbox.component';
import { RegisterComponent } from './components/Auth/register/register.component';
import { StudentInteractionHistoryComponent } from './components/Student/student-interaction-history/student-interaction-history.component';
import { GraderInteractionHistoryComponent } from './components/Student/grader-interaction-history/grader-interaction-history.component';
import { professorGuard } from 'src/app/guards/professor.guard';
import { studentGuard } from './guards/student.guard';
import { RosterComponent } from './components/Professor/roster/roster.component';
import { AssignmentsComponent } from './components/Professor/assignments/assignments.component';
import { ResetPasswordComponent } from './components/Auth/reset-password/reset-password.component';
import { AboutComponent } from './components/about/about.component';
import { GraderDashboardComponent } from './components/Student/grader-dashboard/grader-dashboard.component';
import { ConfirmationComponent } from './components/Auth/confirmation/confirmation.component';
import { RequestTokenComponent } from './components/Auth/request-token/request-token.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'request-token',
    component: RequestTokenComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: 'confirmation',
    component: ConfirmationComponent,
  },
  {
    path: 'professor',
    component: ProfessorNavigationComponent,
    canActivate: [professorGuard],
    canActivateChild: [professorGuard],
    children: [
      {
        path: 'appeal-inbox',
        component: ProfessorAppealInboxComponent,
      },
      {
        path: 'interaction-history',
        component: ProfessorInteractionHistoryComponent,
      },
      {
        path: 'interaction-history/:id',
        component: ProfessorInteractionHistoryComponent,
      },
      {
        path: 'roster/:id',
        component: RosterComponent,
      },
      {
        path: 'assignments/:id',
        component: AssignmentsComponent,
      },
      {
        path: 'closed-appeals',
        component: ClosedAppealsComponent,
      },
      {
        path: 'courses',
        component: CoursesComponent,
      },
      {
        path: 'edit-templates',
        component: EditTemplatesComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
      },
    ],
  },
  {
    path: 'student',
    component: StudentNavigationComponent,
    canActivate: [studentGuard],
    canActivateChild: [studentGuard],
    children: [
      {
        path: 'courses',
        component: StudentDashboardComponent,
      },
      {
        path: 'student/:id',
        component: StudentDashboardComponent,
      },
      {
        path: 'interaction-history',
        component: StudentInteractionHistoryComponent,
      },
      {
        path: 'interaction-history/:appealId',
        component: StudentInteractionHistoryComponent,
      },
      {
        path: 'grader/interaction-history',
        component: GraderInteractionHistoryComponent,
      },
      {
        path: 'grader/interaction-history/:id',
        component: GraderInteractionHistoryComponent,
      },
      {
        path: 'grader/courses',
        component: GraderDashboardComponent,
      },
      {
        path: 'new-appeal/:courseId',
        component: NewAppealComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
