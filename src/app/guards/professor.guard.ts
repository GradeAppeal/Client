import { CanActivateChildFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Session } from '@supabase/supabase-js';

export const professorGuard: CanActivateChildFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const session = (await authService.getSession()) as Session;
  const user = session.user;
  if (user && user.email) {
    const userRole = await authService.getRole(user.email);
    const isUserLoggedIn = await authService.isLoggedIn();
    if (isUserLoggedIn && userRole === 'professor') {
      return true;
    } else {
      router.navigate(['']);
      return false;
    }
  }
  router.navigate(['']);
  return false;
};
