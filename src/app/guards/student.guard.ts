import { CanActivateChildFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Session } from '@supabase/supabase-js';

export const studentGuard: CanActivateChildFn = async (route, state) => {
  const authService = inject(AuthService);
  const session = (await authService.getSession()) as Session;
  const user = session.user;
  if (user && user.email) {
    const userRole = await authService.getRole(user.email);
    const isUserLoggedIn = await authService.isLoggedIn();
    if (isUserLoggedIn && userRole === 'student') {
      return true;
    } else {
      return false;
    }
  }
  return false;
};
