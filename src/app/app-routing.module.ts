import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { StudentDashboardComponent } from './components/home/student-dashboard/student-dashboard.component';
import { ProfessorDashboardComponent } from './components/home/professor-dashboard/professor-dashboard.component';
import { ClosedAppealsComponent } from './components/closed-appeals/closed-appeals.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfessorNavigationComponent } from './components/professor-navigation/professor-navigation.component';
import { ChatComponent } from './components/chat/chat.component';
import { EditTemplatesComponent } from './components/edit-templates/edit-templates.component';
const routes: Routes = [
  {
    path: "",
    component: LoginComponent,
  },
  {
    path: "student",
    component: StudentDashboardComponent,
  },
  {
    path: "student/:id",
    component: StudentDashboardComponent,
  },
  {
    path: "professor",
    component: ProfessorDashboardComponent,
  },
  {
    path: "professor/chat",
    component: ChatComponent,
  },
  {
    path: "professor/closed-appeals",
    component: ClosedAppealsComponent,
  },
  {
    path: "professor/profile",
    component: ProfileComponent,
  },
  {
    path: "professor/edit-templates",
    component: EditTemplatesComponent,
  },
  {
    path: "**",
    redirectTo: "/",
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
