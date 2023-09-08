import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { StudentDashboardComponent } from './components/home/student-dashboard/student-dashboard.component';
import { ProfessorDashboardComponent } from './components/home/professor-dashboard/professor-dashboard.component';
import { AuthComponent } from './auth/auth.component';

const routes: Routes = [
  {
    path: "",
    component: AuthComponent,
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
    path: "professor/:id",
    component: ProfessorDashboardComponent,
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
