import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { StudentDashboardComponent } from './components/Student/student-dashboard/student-dashboard.component';
import { ClosedAppealsComponent } from './components/Professor/closed-appeals/closed-appeals.component';
import { ProfileComponent } from './components/Professor/profile/profile.component';
import { ProfessorNavigationComponent } from './components/Professor/professor-navigation/professor-navigation.component';
import { ProfessorInteractionHistoryComponent } from './components/Professor/professor-interaction-history/professor-interaction-history.component';
import { EditTemplatesComponent } from './components/Professor/edit-templates/edit-templates.component';
import { StudentNavigationComponent } from './components/Student/student-navigation/student-navigation.component';
import { NewAppealComponent } from './components/Student/new-appeal/new-appeal.component';
import { ProfessorAppealInboxComponent } from './components/Professor/professor-appeal-inbox/professor-appeal-inbox.component';
import { AdminComponent } from './components/admin/admin.component';
import { RegisterComponent } from './components/register/register.component';

import { StudentInteractionHistoryComponent } from './components/Student/student-interaction-history/student-interaction-history.component';
const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'professor',
    component: ProfessorNavigationComponent,
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
        path: 'closed-appeals',
        component: ClosedAppealsComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'edit-templates',
        component: EditTemplatesComponent,
      },
    ],
  },
  {
    path: 'student',
    component: StudentNavigationComponent,
    children: [
      {
        path: 'course-dashboard',
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
        path: 'student-interaction-history',
        component: StudentInteractionHistoryComponent,
      },
    ],
  },

  {
    path: 'professor',
    component: ProfessorNavigationComponent,
  },
  {
    path: 'professor/closed-appeals',
    component: ClosedAppealsComponent,
  },
  {
    path: 'professor/profile',
    component: ProfileComponent,
  },
  {
    path: 'professor/edit-templates',
    component: EditTemplatesComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
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
